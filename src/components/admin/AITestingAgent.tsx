import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Sparkles, Download, FlaskConical } from "lucide-react";
import { getRegistry, getGroups, type FeatureTest } from "@/lib/featureRegistry";
import "@/features/index";

interface TestResult extends FeatureTest {
  status: "pass" | "fail" | "warning";
  summary: string;
  what_was_checked: string;
  potential_issues: string[];
  suggested_fix: string | null;
}

const AITestingAgent = () => {
  const allScenarios = useMemo(() => getRegistry(), []);
  const groups = useMemo(() => getGroups(), []);

  const [selected, setSelected] = useState<Set<string>>(() => new Set(getRegistry().map((t) => t.id)));
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [filterGroup, setFilterGroup] = useState("All");

  const visibleScenarios = useMemo(
    () => filterGroup === "All" ? allScenarios : allScenarios.filter((t) => t.group === filterGroup),
    [filterGroup, allScenarios]
  );

  const toggleAll = () => {
    const visibleIds = visibleScenarios.map((t) => t.id);
    const allSelected = visibleIds.every((id) => selected.has(id));
    const next = new Set(selected);
    visibleIds.forEach((id) => allSelected ? next.delete(id) : next.add(id));
    setSelected(next);
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const runTests = async () => {
    const testsToRun = allScenarios.filter((t) => selected.has(t.id));
    setRunning(true);
    setResults([]);
    setProgress(0);

    for (let i = 0; i < testsToRun.length; i++) {
      const test = testsToRun[i];
      setCurrentTest(test.name);
      setProgress(Math.round((i / testsToRun.length) * 100));

      try {
        const { data, error } = await supabase.functions.invoke("ai-test-runner", {
          body: {
            test_name: test.name,
            test_description: test.description,
            test_route: test.route,
            test_implementation: test.implementation,
          },
        });

        if (error) throw error;

        const parsed = data as { status: string; summary: string; what_was_checked: string; potential_issues: string[]; suggested_fix: string | null };
        setResults((prev) => [...prev, {
          ...test,
          status: (parsed.status as "pass" | "fail" | "warning") || "warning",
          summary: parsed.summary || "No summary",
          what_was_checked: parsed.what_was_checked || test.description,
          potential_issues: parsed.potential_issues || [],
          suggested_fix: parsed.suggested_fix || null,
        }]);
      } catch (err: any) {
        setResults((prev) => [...prev, {
          ...test,
          status: "warning",
          summary: "AI check failed \u2014 verify manually",
          what_was_checked: test.description,
          potential_issues: [err.message || "Unknown error"],
          suggested_fix: null,
        }]);
      }

      await new Promise((r) => setTimeout(r, 600));
    }

    setProgress(100);
    setRunning(false);
    setCurrentTest(null);
  };

  const downloadReport = () => {
    const pass = results.filter((r) => r.status === "pass").length;
    const fail = results.filter((r) => r.status === "fail").length;
    const warn = results.filter((r) => r.status === "warning").length;

    const report = [
      "# Evnting Platform QA Report",
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      `Results: ${pass} passed \u00b7 ${warn} warnings \u00b7 ${fail} failed`,
      `Total scenarios: ${results.length}`,
      "",
      ...results.map((r) =>
        [
          `## ${r.status === "pass" ? "\u2705" : r.status === "fail" ? "\u274c" : "\u26a0\ufe0f"} [${r.group}] ${r.name}`,
          `Status: ${r.status.toUpperCase()}`,
          `Summary: ${r.summary}`,
          `Checked: ${r.what_was_checked}`,
          r.potential_issues?.length ? `Issues: ${r.potential_issues.join(", ")}` : "",
          r.suggested_fix ? `Fix: ${r.suggested_fix}` : "",
          "",
        ].filter(Boolean).join("\n")
      ),
    ].join("\n");

    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evnting-qa-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const warnCount = results.filter((r) => r.status === "warning").length;
  const selectedCount = allScenarios.filter((t) => selected.has(t.id)).length;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT — Test suite */}
      <div className="lg:w-80 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Test scenarios ({allScenarios.length})</h3>
          <button onClick={toggleAll} className="text-[10px] text-primary hover:text-primary/80 font-medium">
            {visibleScenarios.every((t) => selected.has(t.id)) ? "Deselect all" : "Select all"}
          </button>
        </div>

        {/* Group filter */}
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-1 max-h-[55vh] overflow-y-auto pr-1">
          {visibleScenarios.map((test) => (
            <label key={test.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Checkbox
                checked={selected.has(test.id)}
                onCheckedChange={() => toggle(test.id)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs text-foreground leading-tight">{test.name}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={runTests}
            disabled={running || selectedCount === 0}
            size="sm"
            className="flex-1 gap-1.5"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
            {running ? `Testing... (${progress}%)` : `Run ${selectedCount} test${selectedCount !== 1 ? "s" : ""}`}
          </Button>
          {results.length > 0 && !running && (
            <Button variant="outline" size="sm" onClick={downloadReport} className="gap-1">
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT — Results */}
      <div className="flex-1 min-w-0 space-y-4">
        {running && currentTest && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-foreground">Testing: {currentTest}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Passed", count: passCount, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "Warnings", count: warnCount, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { label: "Failed", count: failCount, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !running && (
          <div className="text-center py-16">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">Select tests and click Run</p>
            <p className="text-xs text-muted-foreground mt-1">AI will check each feature and report issues</p>
          </div>
        )}

        <div className="space-y-3">
          {results.map((result) => (
            <div key={result.id} className="bg-card border border-border/60 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {result.status === "pass" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : result.status === "fail" ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[9px] text-muted-foreground">{result.group}</Badge>
                    <h4 className="text-sm font-semibold text-foreground">{result.name}</h4>
                    <Badge className={`text-[9px] ${
                      result.status === "pass" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      result.status === "fail" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>{result.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{result.summary}</p>
                  {result.potential_issues?.length > 0 && (
                    <div className="space-y-0.5 mt-1">
                      {result.potential_issues.map((issue, i) => (
                        <p key={i} className="text-[11px] text-amber-600 dark:text-amber-400">&bull; {issue}</p>
                      ))}
                    </div>
                  )}
                  {result.suggested_fix && (
                    <div className="bg-muted/50 rounded-lg p-2 mt-1.5">
                      <p className="text-[11px] text-muted-foreground"><span className="font-medium text-foreground">Fix:</span> {result.suggested_fix}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITestingAgent;
