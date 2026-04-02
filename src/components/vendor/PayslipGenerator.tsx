import { useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PayrollRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  working_days: number;
  days_present: number;
  days_absent: number;
  days_leave: number;
  basic_earned: number;
  hra_earned: number;
  allowances: number;
  gross_salary: number;
  pf_deduction: number;
  esi_deduction: number;
  other_deductions: number;
  net_salary: number;
  bonus: number;
  advance_deduction: number;
  status: string;
  paid_at: string | null;
  payment_mode: string | null;
}

interface Employee {
  id: string;
  full_name: string;
  role: string;
  base_salary: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PayslipGenerator = ({
  record,
  employee,
  open,
  onOpenChange,
}: {
  record: PayrollRecord;
  employee: Employee | undefined;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const { user } = useAuth();
  const { data: profile } = useVendorProfile(user?.id);
  const printRef = useRef<HTMLDivElement>(null);

  const companyName = profile?.company_name || profile?.full_name || "Company";
  const payPeriod = `${MONTHS[record.month - 1]} ${record.year}`;
  const totalDeductions = record.pf_deduction + record.esi_deduction + record.other_deductions + record.advance_deduction;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=800,height=1000");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${employee?.full_name} - ${payPeriod}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; padding: 32px; }
          .payslip { max-width: 700px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
          .header { background: #1e293b; color: white; padding: 20px 24px; }
          .header h1 { font-size: 18px; font-weight: 700; }
          .header p { font-size: 12px; opacity: 0.7; margin-top: 2px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
          .meta-item label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.05em; }
          .meta-item p { font-size: 13px; font-weight: 600; margin-top: 2px; }
          .section { padding: 16px 24px; }
          .section-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px 0; font-size: 13px; }
          th { text-align: left; color: #64748b; font-weight: 500; }
          td:last-child { text-align: right; font-weight: 600; }
          tr { border-bottom: 1px solid #f1f5f9; }
          tr:last-child { border-bottom: none; }
          .total-row { border-top: 2px solid #e2e8f0; }
          .total-row td { padding-top: 12px; font-weight: 700; font-size: 14px; }
          .net-pay { background: #f0fdf4; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #e2e8f0; }
          .net-pay .label { font-size: 14px; font-weight: 700; color: #1a1a2e; }
          .net-pay .amount { font-size: 22px; font-weight: 800; color: #16a34a; }
          .attendance { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 16px 24px; background: #f8fafc; }
          .att-item { text-align: center; }
          .att-item .num { font-size: 18px; font-weight: 700; }
          .att-item .lbl { font-size: 10px; color: #64748b; text-transform: uppercase; }
          .footer { padding: 12px 24px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          @media print { body { padding: 0; } .payslip { border: none; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Payslip — {payPeriod}</DialogTitle>
            <Button size="sm" className="gap-1.5" onClick={handlePrint}>
              <Download className="h-3.5 w-3.5" />Download PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4">
          <div ref={printRef}>
            <div className="payslip" style={{ maxWidth: 700, margin: "0 auto", border: "2px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: "#1e293b", color: "white", padding: "20px 24px" }}>
                <h1 style={{ fontSize: 18, fontWeight: 700 }}>{companyName}</h1>
                <p style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Payslip for {payPeriod}</p>
              </div>

              {/* Employee Meta */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Employee Name</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{employee?.full_name || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Designation</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, textTransform: "capitalize" }}>{employee?.role || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Employee ID</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{employee?.id.slice(0, 8).toUpperCase()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Pay Period</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{payPeriod}</div>
                </div>
              </div>

              {/* Earnings + Deductions side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                {/* Earnings */}
                <div style={{ padding: "16px 24px", borderRight: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 8 }}>Earnings</div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {[
                        ["Basic Salary", record.basic_earned],
                        ["HRA", record.hra_earned],
                        ["Allowances", record.allowances],
                        ["Bonus", record.bonus],
                      ].map(([label, val]) => (
                        <tr key={label as string} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "6px 0", fontSize: 12, color: "#475569" }}>{label}</td>
                          <td style={{ padding: "6px 0", fontSize: 12, fontWeight: 600, textAlign: "right" }}>₹{fmt(val as number)}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: "2px solid #e2e8f0" }}>
                        <td style={{ padding: "10px 0 6px", fontSize: 13, fontWeight: 700 }}>Gross Total</td>
                        <td style={{ padding: "10px 0 6px", fontSize: 13, fontWeight: 700, textAlign: "right" }}>₹{fmt(record.gross_salary)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions */}
                <div style={{ padding: "16px 24px" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748b", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 8 }}>Deductions</div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {[
                        ["PF Deduction", record.pf_deduction],
                        ["ESI Deduction", record.esi_deduction],
                        ["Advance Recovery", record.advance_deduction],
                        ["Other Deductions", record.other_deductions],
                      ].map(([label, val]) => (
                        <tr key={label as string} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "6px 0", fontSize: 12, color: "#475569" }}>{label}</td>
                          <td style={{ padding: "6px 0", fontSize: 12, fontWeight: 600, textAlign: "right", color: "#dc2626" }}>₹{fmt(val as number)}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: "2px solid #e2e8f0" }}>
                        <td style={{ padding: "10px 0 6px", fontSize: 13, fontWeight: 700 }}>Total Deductions</td>
                        <td style={{ padding: "10px 0 6px", fontSize: 13, fontWeight: 700, textAlign: "right", color: "#dc2626" }}>₹{fmt(totalDeductions)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Net Pay */}
              <div style={{ background: "#f0fdf4", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #e2e8f0" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>NET PAY</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#16a34a" }}>₹{fmt(record.net_salary)}</span>
              </div>

              {/* Attendance Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "16px 24px", background: "#f8fafc" }}>
                {[
                  { num: record.working_days, lbl: "Working Days" },
                  { num: record.days_present, lbl: "Present" },
                  { num: record.days_absent, lbl: "Absent" },
                  { num: record.days_leave, lbl: "Leave" },
                ].map((item) => (
                  <div key={item.lbl} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{item.num}</div>
                    <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>{item.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: "12px 24px", textAlign: "center", fontSize: 10, color: "#94a3b8", borderTop: "1px solid #e2e8f0" }}>
                This is a computer-generated payslip and does not require a signature. Generated on {new Date().toLocaleDateString("en-IN")}.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayslipGenerator;
