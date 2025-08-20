import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, X, Send, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: string[];
}

interface CustomerData {
  name: string;
  phone: string;
  email: string;
  intent: 'event' | 'rental' | '';
  eventType?: string;
  eventDetails?: string;
  rentalItems?: string;
  quantity?: string;
  location?: string;
}

export const WhatsAppBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    email: '',
    intent: '',
    location: '',
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        addBotMessage(
          "👋 Hi! Welcome to Avens Events! I'm here to help you plan your perfect event or find rental equipment. What can I assist you with today?",
          ['🎉 Plan an Event', '🏠 Rent Equipment', '📞 Contact Support']
        );
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen]);

  const addBotMessage = (text: string, options?: string[]) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
      options,
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleOptionClick = async (option: string) => {
    addUserMessage(option);
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (currentStep === 'welcome') {
      if (option.includes('Plan an Event')) {
        setCustomerData(prev => ({ ...prev, intent: 'event' }));
        setCurrentStep('event_type');
        addBotMessage(
          "Great choice! What type of event are you planning?",
          ['💒 Wedding', '🏢 Corporate Event', '🎂 Birthday Party', '🏛️ Government Event', '🎭 Other']
        );
      } else if (option.includes('Rent Equipment')) {
        setCustomerData(prev => ({ ...prev, intent: 'rental' }));
        setCurrentStep('rental_items');
        addBotMessage(
          "Perfect! What equipment are you looking to rent?",
          ['🪑 Furniture & Seating', '🔊 Audio/Visual', '🏕️ Tents & Canopies', '🍽️ Catering Equipment', '💡 Lighting', '📝 Tell me more']
        );
      } else {
        setCurrentStep('contact_info');
        addBotMessage(
          "I'll connect you with our support team! First, let me get your contact information.",
        );
      }
    } else if (currentStep === 'event_type') {
      let eventType = '';
      if (option.includes('Wedding')) eventType = 'wedding';
      else if (option.includes('Corporate')) eventType = 'corporate';
      else if (option.includes('Birthday')) eventType = 'birthday';
      else if (option.includes('Government')) eventType = 'government';
      else eventType = 'other';

      setCustomerData(prev => ({ ...prev, eventType }));
      setCurrentStep('event_details');
      addBotMessage(
        `Wonderful! Tell me more about your ${eventType} event. What's your vision?`
      );
    } else if (currentStep === 'rental_items') {
      let items = '';
      if (option.includes('Furniture')) items = 'Furniture & Seating';
      else if (option.includes('Audio')) items = 'Audio/Visual Equipment';
      else if (option.includes('Tents')) items = 'Tents & Canopies';
      else if (option.includes('Catering')) items = 'Catering Equipment';
      else if (option.includes('Lighting')) items = 'Lighting Equipment';
      else items = 'Custom Request';

      setCustomerData(prev => ({ ...prev, rentalItems: items }));
      
      if (option.includes('Tell me more')) {
        setCurrentStep('rental_details');
        addBotMessage("Please describe what specific equipment you need:");
      } else {
        setCurrentStep('rental_quantity');
        addBotMessage(`Great choice! How many items or what quantity do you need for ${items}?`);
      }
    }

    setIsTyping(false);
  };

  const handleTextInput = async (text: string) => {
    if (!text.trim()) return;

    addUserMessage(text);
    setInputValue('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (currentStep === 'event_details') {
      setCustomerData(prev => ({ ...prev, eventDetails: text }));
      setCurrentStep('contact_info');
      addBotMessage("Excellent! Now I need your contact information to connect you with our event specialists.");
    } else if (currentStep === 'rental_details') {
      setCustomerData(prev => ({ ...prev, rentalItems: text }));
      setCurrentStep('rental_quantity');
      addBotMessage("Perfect! How many items or what quantity do you need?");
    } else if (currentStep === 'rental_quantity') {
      setCustomerData(prev => ({ ...prev, quantity: text }));
      setCurrentStep('contact_info');
      addBotMessage("Great! Now I need your contact information to provide you with a quote.");
    } else if (currentStep === 'contact_info') {
      // Handle contact info collection step by step
      if (!customerData.name) {
        setCustomerData(prev => ({ ...prev, name: text }));
        addBotMessage(`Nice to meet you, ${text}! What's your phone number?`);
      } else if (!customerData.phone) {
        setCustomerData(prev => ({ ...prev, phone: text }));
        addBotMessage("Perfect! And your email address?");
      } else if (!customerData.email) {
        setCustomerData(prev => ({ ...prev, email: text }));
        addBotMessage("Finally, what's your location or where is the event/delivery?");
      } else if (!customerData.location) {
        setCustomerData(prev => ({ ...prev, location: text }));
        setCurrentStep('submit');
        await submitToHubSpot();
      }
    }

    setIsTyping(false);
  };

  const submitToHubSpot = async () => {
    try {
      // First save to Supabase
      const formData = {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        message: customerData.intent === 'event' 
          ? `Event Type: ${customerData.eventType}\nDetails: ${customerData.eventDetails}`
          : `Rental Items: ${customerData.rentalItems}\nQuantity: ${customerData.quantity}`,
        form_type: customerData.intent === 'event' ? 'event' : 'rental',
        event_type: customerData.eventType || null,
        rental_title: customerData.rentalItems || null,
        location: customerData.location,
        status: 'new'
      };

      const { data: submission, error } = await supabase
        .from('form_submissions')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;

      // Send to HubSpot
      const response = await supabase.functions.invoke('hubspot-integration', {
        body: {
          submissionId: submission.id,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          message: formData.message,
          formType: formData.form_type,
          eventType: customerData.eventType,
          rentalTitle: customerData.rentalItems,
          location: customerData.location,
        },
      });

      addBotMessage(
        `🎉 Perfect! I've saved all your information and our team will contact you within 24 hours.\n\n📧 Email: ${customerData.email}\n📱 Phone: ${customerData.phone}\n📍 Location: ${customerData.location}\n\nThank you for choosing Avens Events!`
      );

      toast({
        title: "Information Submitted!",
        description: "Our team will contact you within 24 hours.",
      });

    } catch (error) {
      console.error('Error submitting to HubSpot:', error);
      addBotMessage(
        "I've saved your information locally, but there was an issue with our CRM. Don't worry - our team will still contact you soon!"
      );
    }
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep('welcome');
    setCustomerData({
      name: '',
      phone: '',
      email: '',
      intent: '',
      location: '',
    });
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
        size="icon"
      >
        <MessageCircle className="h-8 w-8 text-white" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="bg-green-500 text-white p-4 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-white">Avens Events Bot</DialogTitle>
                <p className="text-green-100 text-sm">Online now</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-white border shadow-sm'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  {message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2 px-3"
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          {currentStep !== 'submit' && (
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTextInput(inputValue);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleTextInput(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  size="icon"
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  className="mt-2 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Start Over
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppBot;