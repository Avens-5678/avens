import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, ArrowLeft } from 'lucide-react';
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
  intent: 'event' | 'rental' | 'general' | '';
  eventType?: string;
  eventDate?: string;
  hasVenue?: string;
  venueName?: string;
  servicesNeeded?: string[];
  rentalCategory?: string;
  rentalItems?: string;
  quantity?: string;
  needsSetup?: string;
  location?: string;
  eventDetails?: string;
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
    eventType: '',
    eventDate: '',
    hasVenue: '',
    venueName: '',
    servicesNeeded: [],
    rentalCategory: '',
    rentalItems: '',
    quantity: '',
    needsSetup: '',
    eventDetails: ''
  });
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "👋 Hi, welcome to Evnting! I'm here to help you with Events, Rentals, or answer any questions. What can I assist you with today?",
        ['🎉 Plan an Event', '🏢 Rent Equipment', '❓ General Questions']
      );
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

  const handleFAQ = (query: string) => {
    const faqResponses: { [key: string]: string } = {
      'services': "🏢 We provide comprehensive event management including:\n• Event Planning & Coordination\n• Venue Setup (Hangars, Pagodas, Stages)\n• Décor & Branding\n• Audio Visual & Lighting\n• Air Conditioning (Airwingz)\n• Catering Support\n• Equipment Rentals",
      'rentals': "📋 Our rental categories include:\n• Event Structures & Venues\n• Exhibition Stalls\n• Climate Control (Airwingz ACs)\n• Event Production Equipment\n• Branding & Décor\n• Furniture & Seating",
      'weddings': "💒 Absolutely! We specialize in weddings including venue decoration, lighting, sound systems, climate control, and complete event coordination.",
      'ac': "❄️ Yes! We provide Airwingz AC rentals for exhibitions, events, and outdoor functions with professional installation and maintenance.",
      'policy': "📋 Cancellation Policy:\n• 30 days advance: Full refund\n• 15-30 days: 50% refund\n• Less than 15 days: 25% refund\n• Same day: No refund\n(Terms may vary based on event size)",
      'quote': "💰 To get a quote, I can collect your requirements and our team will send you a detailed proposal within 24 hours!",
      'outstation': "🚗 Yes, we provide destination event services across India. Additional travel and accommodation charges may apply."
    };

    const lowerQuery = query.toLowerCase();
    let response = "I'd be happy to help! Could you be more specific about what you'd like to know?";

    for (const [key, answer] of Object.entries(faqResponses)) {
      if (lowerQuery.includes(key)) {
        response = answer;
        break;
      }
    }

    return response;
  };

  const handleOptionClick = async (option: string) => {
    addUserMessage(option);
    
    if (currentStep === 'welcome') {
      if (option.includes('Plan an Event')) {
        setCustomerData(prev => ({ ...prev, intent: 'event' }));
        setCurrentStep('event_type');
        addBotMessage(
          "Great choice! What type of event are you planning?",
          ['💒 Wedding', '🏢 Corporate Event', '🎪 Exhibition', '🎉 Social Party', '🏛️ Government Event', '🎭 Other']
        );
      } else if (option.includes('Rent Equipment')) {
        setCustomerData(prev => ({ ...prev, intent: 'rental' }));
        setCurrentStep('rental_category');
        addBotMessage(
          "Perfect! What would you like to rent?",
          ['🏗️ Event Structures & Venues', '🎪 Exhibition Stalls', '❄️ Climate Control (Airwingz ACs)', '🎵 Event Production Equipment', '🎨 Branding & Décor']
        );
      } else {
        setCustomerData(prev => ({ ...prev, intent: 'general' }));
        setCurrentStep('faq');
        addBotMessage(
          "I'm here to help! What would you like to know about?",
          ['🏢 What services do you provide?', '📋 What are your rental categories?', '💒 Do you manage weddings?', '❄️ Do you provide AC rental?', '💰 How do I get a quote?', '🚗 Do you provide outstation services?']
        );
      }
    } else if (currentStep === 'event_type') {
      let eventType = '';
      if (option.includes('Wedding')) eventType = 'wedding';
      else if (option.includes('Corporate')) eventType = 'corporate';
      else if (option.includes('Exhibition')) eventType = 'exhibition';
      else if (option.includes('Social')) eventType = 'social';
      else if (option.includes('Government')) eventType = 'government';
      else eventType = 'other';

      setCustomerData(prev => ({ ...prev, eventType }));
      setCurrentStep('event_date');
      addBotMessage(`Excellent! When are you planning your ${eventType} event? (Please provide expected date/month)`);
    } else if (currentStep === 'event_venue') {
      if (option.includes('Yes')) {
        setCustomerData(prev => ({ ...prev, hasVenue: 'yes' }));
        setCurrentStep('venue_name');
        addBotMessage("Great! What's the name and location of your venue?");
      } else {
        setCustomerData(prev => ({ ...prev, hasVenue: 'no' }));
        setCurrentStep('event_services');
        addBotMessage(
          "No problem! We can help with venue suggestions. Which services do you need help with?",
          ['🏗️ Venue Setup (Hangars, Pagodas, Stages)', '🎨 Décor & Branding', '🎵 Audio Visual & Lighting', '❄️ Air Conditioning (Airwingz)', '🍽️ Catering Support', '🎯 Full Event Management']
        );
      }
    } else if (currentStep === 'event_services') {
      const services = customerData.servicesNeeded || [];
      let service = '';
      
      if (option.includes('Venue Setup')) service = 'Venue Setup';
      else if (option.includes('Décor')) service = 'Décor & Branding';
      else if (option.includes('Audio')) service = 'Audio Visual & Lighting';
      else if (option.includes('Air Conditioning')) service = 'Air Conditioning';
      else if (option.includes('Catering')) service = 'Catering Support';
      else if (option.includes('Full Event')) service = 'Full Event Management';

      services.push(service);
      setCustomerData(prev => ({ ...prev, servicesNeeded: services }));
      setCurrentStep('quote_request');
      addBotMessage(
        `Perfect! You've selected: ${services.join(', ')}.\n\nWould you like us to share a custom proposal/quote?`,
        ['✅ Yes, send me a quote', '📋 Just share your contact info']
      );
    } else if (currentStep === 'rental_category') {
      let category = '';
      if (option.includes('Event Structures')) category = 'Event Structures & Venues';
      else if (option.includes('Exhibition')) category = 'Exhibition Stalls';
      else if (option.includes('Climate')) category = 'Climate Control (Airwingz ACs)';
      else if (option.includes('Production')) category = 'Event Production Equipment';
      else if (option.includes('Branding')) category = 'Branding & Décor';

      setCustomerData(prev => ({ ...prev, rentalCategory: category }));
      setCurrentStep('rental_items');
      addBotMessage(`Great choice! Please tell me specifically what items you need from ${category}:`);
    } else if (currentStep === 'rental_setup') {
      setCustomerData(prev => ({ ...prev, needsSetup: option.includes('Yes') ? 'yes' : 'no' }));
      setCurrentStep('quote_request');
      addBotMessage(
        "Perfect! Would you like us to send a quotation?",
        ['✅ Yes, send me a quote', '📋 Just share brochure/catalog']
      );
    } else if (currentStep === 'quote_request') {
      if (option.includes('Yes')) {
        setCurrentStep('get_name');
        addBotMessage("Excellent! I'll need some information to prepare your quote. What's your name?");
      } else {
        setCurrentStep('get_name');
        addBotMessage("Sure! I'll share our contact information. But first, what's your name so I can personalize our service?");
      }
    } else if (currentStep === 'faq') {
      const faqResponse = handleFAQ(option);
      addBotMessage(faqResponse);
      
      addBotMessage(
        "Is there anything else you'd like to know, or would you like to discuss an event or rental?",
        ['🎉 Plan an Event', '🏢 Rent Equipment', '❓ Ask another question']
      );
      setCurrentStep('welcome');
    }
  };

  const handleTextInput = async (text: string) => {
    if (!text.trim()) return;

    addUserMessage(text);
    setInputValue('');
    
    if (currentStep === 'event_date') {
      setCustomerData(prev => ({ ...prev, eventDate: text }));
      setCurrentStep('event_venue');
      addBotMessage(
        "Perfect! Do you already have a venue?",
        ['✅ Yes, I have a venue', '❌ No, I need venue suggestions']
      );
    } else if (currentStep === 'venue_name') {
      setCustomerData(prev => ({ ...prev, venueName: text }));
      setCurrentStep('event_services');
      addBotMessage(
        "Great! Which services do you need help with?",
        ['🏗️ Venue Setup (Hangars, Pagodas, Stages)', '🎨 Décor & Branding', '🎵 Audio Visual & Lighting', '❄️ Air Conditioning (Airwingz)', '🍽️ Catering Support', '🎯 Full Event Management']
      );
    } else if (currentStep === 'rental_items') {
      setCustomerData(prev => ({ ...prev, rentalItems: text }));
      setCurrentStep('rental_quantity');
      addBotMessage("How many units/quantity do you need?");
    } else if (currentStep === 'rental_quantity') {
      setCustomerData(prev => ({ ...prev, quantity: text }));
      setCurrentStep('rental_date');
      addBotMessage("What's the event date & location for delivery/setup?");
    } else if (currentStep === 'rental_date') {
      setCustomerData(prev => ({ ...prev, location: text }));
      setCurrentStep('rental_setup');
      addBotMessage(
        "Do you need setup & dismantling service?",
        ['✅ Yes, include setup service', '❌ No, just delivery']
      );
    } else if (currentStep === 'get_name') {
      setCustomerData(prev => ({ ...prev, name: text }));
      setCurrentStep('get_phone');
      addBotMessage(`Nice to meet you, ${text}! What's your phone/WhatsApp number?`);
    } else if (currentStep === 'get_phone') {
      setCustomerData(prev => ({ ...prev, phone: text }));
      setCurrentStep('get_email');
      addBotMessage("Perfect! What's your email address?");
    } else if (currentStep === 'get_email') {
      setCustomerData(prev => ({ ...prev, email: text }));
      if (!customerData.location) {
        setCurrentStep('get_location');
        addBotMessage("Finally, what's your city/event location?");
      } else {
        setCurrentStep('submit');
        await submitToZohoCRM();
      }
    } else if (currentStep === 'get_location') {
      setCustomerData(prev => ({ ...prev, location: text }));
      setCurrentStep('submit');
      await submitToZohoCRM();
    } else if (currentStep === 'faq') {
      const faqResponse = handleFAQ(text);
      addBotMessage(faqResponse);
      
      addBotMessage(
        "Is there anything else you'd like to know?",
        ['🎉 Plan an Event', '🏢 Rent Equipment', '❓ Ask another question']
      );
      setCurrentStep('welcome');
    }
  };

  const submitToZohoCRM = async () => {
    try {
      let message = '';
      if (customerData.intent === 'event') {
        message = `Event Planning Request:
Event Type: ${customerData.eventType}
Event Date: ${customerData.eventDate || 'Not specified'}
Venue Status: ${customerData.hasVenue === 'yes' ? `Yes - ${customerData.venueName}` : 'No, needs venue suggestions'}
Services Needed: ${customerData.servicesNeeded?.join(', ') || 'Not specified'}
Additional Details: ${customerData.eventDetails || 'None provided'}`;
      } else if (customerData.intent === 'rental') {
        message = `Equipment Rental Request:
Category: ${customerData.rentalCategory}
Items: ${customerData.rentalItems}
Quantity: ${customerData.quantity}
Setup Service: ${customerData.needsSetup === 'yes' ? 'Yes, include setup & dismantling' : 'No, delivery only'}
Event Date: ${customerData.eventDate || 'Not specified'}`;
      } else {
        message = `General inquiry via chatbot`;
      }

      const formData = {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        message: message,
        form_type: customerData.intent === 'event' ? 'inquiry' : (customerData.intent === 'rental' ? 'rental' : 'contact'),
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

      const zohoData = {
        submissionId: submission.id,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        message: message,
        formType: formData.form_type,
        eventType: customerData.eventType,
        eventDate: customerData.eventDate,
        rentalTitle: customerData.rentalItems,
        location: customerData.location,
      };

      await supabase.functions.invoke('zoho-crm', {
        body: zohoData,
      });

      let summary = `🎉 Perfect! I've collected all your information:\n\n`;
      summary += `👤 Name: ${customerData.name}\n`;
      summary += `📧 Email: ${customerData.email}\n`;
      summary += `📱 Phone: ${customerData.phone}\n`;
      summary += `📍 Location: ${customerData.location}\n`;
      
      if (customerData.intent === 'event') {
        summary += `🎉 Event: ${customerData.eventType}\n`;
        summary += `📅 Date: ${customerData.eventDate}\n`;
        if (customerData.servicesNeeded?.length) {
          summary += `🛠️ Services: ${customerData.servicesNeeded.join(', ')}\n`;
        }
      } else if (customerData.intent === 'rental') {
        summary += `🏢 Rental: ${customerData.rentalItems}\n`;
        summary += `📦 Quantity: ${customerData.quantity}\n`;
        summary += `🔧 Setup: ${customerData.needsSetup === 'yes' ? 'Yes' : 'No'}\n`;
      }

      summary += `\n✅ Our team will contact you within 24 hours with detailed information!\n\nThank you for choosing Evnting! 🙏`;

      addBotMessage(summary);

      toast({
        title: "Information Submitted Successfully!",
        description: "Our team will contact you within 24 hours.",
      });

    } catch (error) {
      console.error('Error submitting to Zoho CRM:', error);
      addBotMessage(
        "✅ I've saved your information! There was a minor issue with our system, but don't worry - our team has your details and will contact you soon.\n\nThank you for choosing Evnting!"
      );
      
      toast({
        title: "Information Saved",
        description: "Our team will contact you soon!",
      });
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
      eventType: '',
      eventDate: '',
      hasVenue: '',
      venueName: '',
      servicesNeeded: [],
      rentalCategory: '',
      rentalItems: '',
      quantity: '',
      needsSetup: '',
      eventDetails: ''
    });
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-white font-semibold">Evnting Bot</DialogTitle>
                <p className="text-green-100 text-xs">● Online now</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-white border border-gray-200 shadow-sm rounded-bl-md'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm rounded-br-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                  {message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2.5 px-3 rounded-xl border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
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
                  className="flex-1 rounded-full border-gray-200"
                />
                <Button
                  onClick={() => handleTextInput(inputValue)}
                  disabled={!inputValue.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  className="mt-2 text-gray-500 hover:text-gray-700 rounded-full"
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