import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DemoRequest {
  businessName: string;
  businessType: string;
  services: string;
  tone: string;
  voiceId: string;
  language?: string;
}

// Language-specific scripts
const languageScripts: Record<string, {
  businessScripts: Record<string, { question: string; answer: string }>;
  toneAdjustments: Record<string, { greeting: string; closing: string }>;
}> = {
  "en-US": {
    businessScripts: {
      dental_clinic: {
        question: "Do you have any openings for a cleaning this week?",
        answer: "I'd be happy to help you schedule a cleaning. Let me check our availability. We have openings on Thursday at 2 PM and Friday at 10 AM. Which time works better for you?",
      },
      medical_practice: {
        question: "I need to see the doctor about a persistent headache.",
        answer: "I understand. I can help you schedule an appointment. We have availability tomorrow afternoon at 3 PM, or Thursday morning at 9 AM. Would either work for you?",
      },
      salon: {
        question: "Can I book a haircut for this Saturday?",
        answer: "Absolutely! Let me check Saturday's schedule. We have openings at 11 AM and 2:30 PM. Which time would you prefer?",
      },
      restaurant: {
        question: "Do you have a table for four available tonight?",
        answer: "Let me check our availability for this evening. Yes, we have a lovely table available at 7:30 PM. Would you like me to reserve it?",
      },
      spa: {
        question: "I'd like to book a massage for the weekend.",
        answer: "Wonderful choice! We have availability on Saturday at 1 PM for a 60-minute relaxation massage. Would that work for you?",
      },
      fitness: {
        question: "What time are your morning classes?",
        answer: "We have several morning options! Yoga at 6 AM, spin class at 7 AM, and HIIT at 8 AM. Would you like me to reserve a spot?",
      },
      other: {
        question: "What are your business hours?",
        answer: "We're open Monday through Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. Would you like to schedule an appointment?",
      },
    },
    toneAdjustments: {
      professional: { greeting: "Good day, thank you for calling", closing: "Is there anything else I can assist you with today?" },
      friendly: { greeting: "Hi there! Thanks so much for calling", closing: "Anything else I can help you with?" },
      casual: { greeting: "Hey! Thanks for calling", closing: "Need anything else?" },
    },
  },
  "en-GB": {
    businessScripts: {
      dental_clinic: {
        question: "Have you got any slots for a check-up this week?",
        answer: "I'd be delighted to help you book a check-up. Let me have a look at our diary. We've got availability Thursday at 2 PM and Friday at 10 AM. Which suits you better?",
      },
      medical_practice: {
        question: "I need to see the doctor about a persistent headache.",
        answer: "Of course. I can help you arrange an appointment. We have slots tomorrow afternoon at 3 PM, or Thursday morning at 9 AM. Would either suit?",
      },
      salon: {
        question: "Could I book a haircut for this Saturday?",
        answer: "Certainly! Let me check Saturday's schedule. We've got openings at 11 AM and half two. Which would you prefer?",
      },
      restaurant: {
        question: "Have you got a table for four this evening?",
        answer: "Let me check our bookings for this evening. Yes, we've got a lovely table available at half seven. Shall I reserve it for you?",
      },
      spa: {
        question: "I'd like to book a massage for the weekend.",
        answer: "Lovely! We've got availability on Saturday at 1 PM for a 60-minute relaxation massage. Would that suit you?",
      },
      fitness: {
        question: "What time are your morning classes?",
        answer: "We've got several morning options! Yoga at 6 AM, spin at 7, and HIIT at 8. Shall I book you in?",
      },
      other: {
        question: "What are your opening hours?",
        answer: "We're open Monday to Friday, 9 till 6, and Saturday 10 till 4. Would you like to book an appointment?",
      },
    },
    toneAdjustments: {
      professional: { greeting: "Good day, thank you for calling", closing: "Is there anything else I may assist you with?" },
      friendly: { greeting: "Hello! Thanks ever so much for calling", closing: "Is there anything else I can help with?" },
      casual: { greeting: "Hiya! Thanks for ringing", closing: "Anything else?" },
    },
  },
  "nl-NL": {
    businessScripts: {
      dental_clinic: {
        question: "Heeft u deze week nog plek voor een gebitsreiniging?",
        answer: "Ik help u graag met het inplannen van een gebitsreiniging. Even kijken in onze agenda. We hebben donderdag om 14:00 en vrijdag om 10:00 plek. Welke tijd komt u het beste uit?",
      },
      medical_practice: {
        question: "Ik zou graag de dokter willen spreken over aanhoudende hoofdpijn.",
        answer: "Ik begrijp het. Ik kan u helpen met het maken van een afspraak. We hebben morgenmiddag om 15:00 plek, of donderdagochtend om 9:00. Past een van deze tijden?",
      },
      salon: {
        question: "Kan ik een afspraak maken voor een knipbeurt zaterdag?",
        answer: "Natuurlijk! Even de agenda van zaterdag bekijken. We hebben om 11:00 en 14:30 nog plek. Welke tijd heeft uw voorkeur?",
      },
      restaurant: {
        question: "Heeft u vanavond nog een tafel voor vier personen?",
        answer: "Even kijken wat er beschikbaar is vanavond. Ja, we hebben een mooie tafel om 19:30. Zal ik die voor u reserveren?",
      },
      spa: {
        question: "Ik zou graag een massage willen boeken voor het weekend.",
        answer: "Wat fijn! We hebben zaterdag om 13:00 plek voor een ontspannende massage van 60 minuten. Schikt dat?",
      },
      fitness: {
        question: "Hoe laat zijn de ochtendlessen?",
        answer: "We hebben verschillende opties in de ochtend! Yoga om 6:00, spinning om 7:00 en HIIT om 8:00. Zal ik u inschrijven?",
      },
      other: {
        question: "Wat zijn uw openingstijden?",
        answer: "We zijn open van maandag tot vrijdag van 9:00 tot 18:00, en zaterdag van 10:00 tot 16:00. Wilt u een afspraak maken?",
      },
    },
    toneAdjustments: {
      professional: { greeting: "Goedendag, u spreekt met", closing: "Kan ik u verder nog ergens mee van dienst zijn?" },
      friendly: { greeting: "Hallo! Fijn dat u belt met", closing: "Kan ik nog iets anders voor u betekenen?" },
      casual: { greeting: "Hoi! Bedankt voor het bellen naar", closing: "Nog iets anders?" },
    },
  },
  "de-DE": {
    businessScripts: {
      dental_clinic: {
        question: "Haben Sie diese Woche noch einen Termin für eine Zahnreinigung frei?",
        answer: "Ich helfe Ihnen gerne bei der Terminvereinbarung für eine Zahnreinigung. Lassen Sie mich nachsehen. Wir haben Donnerstag um 14 Uhr und Freitag um 10 Uhr Termine frei. Welche Zeit passt Ihnen besser?",
      },
      medical_practice: {
        question: "Ich möchte wegen anhaltender Kopfschmerzen zum Arzt.",
        answer: "Ich verstehe. Ich kann Ihnen bei der Terminvereinbarung helfen. Wir haben morgen Nachmittag um 15 Uhr Zeit oder Donnerstagvormittag um 9 Uhr. Passt einer dieser Termine?",
      },
      salon: {
        question: "Kann ich für Samstag einen Haarschnitt buchen?",
        answer: "Selbstverständlich! Lassen Sie mich den Samstag prüfen. Wir haben um 11 Uhr und 14:30 Uhr noch Termine frei. Welche Zeit bevorzugen Sie?",
      },
      restaurant: {
        question: "Haben Sie heute Abend noch einen Tisch für vier Personen frei?",
        answer: "Lassen Sie mich die Verfügbarkeit für heute Abend prüfen. Ja, wir haben um 19:30 Uhr einen schönen Tisch frei. Soll ich ihn für Sie reservieren?",
      },
      spa: {
        question: "Ich würde gerne eine Massage für das Wochenende buchen.",
        answer: "Wunderbar! Wir haben am Samstag um 13 Uhr einen Termin für eine 60-minütige Entspannungsmassage frei. Passt Ihnen das?",
      },
      fitness: {
        question: "Wann finden die Morgenkurse statt?",
        answer: "Wir haben verschiedene Morgenangebote! Yoga um 6 Uhr, Spinning um 7 Uhr und HIIT um 8 Uhr. Soll ich Sie anmelden?",
      },
      other: {
        question: "Wie sind Ihre Öffnungszeiten?",
        answer: "Wir haben Montag bis Freitag von 9 bis 18 Uhr geöffnet, und Samstag von 10 bis 16 Uhr. Möchten Sie einen Termin vereinbaren?",
      },
    },
    toneAdjustments: {
      professional: { greeting: "Guten Tag, vielen Dank für Ihren Anruf bei", closing: "Kann ich Ihnen sonst noch behilflich sein?" },
      friendly: { greeting: "Hallo! Schön, dass Sie anrufen bei", closing: "Kann ich noch etwas für Sie tun?" },
      casual: { greeting: "Hi! Danke für Ihren Anruf bei", closing: "Noch etwas?" },
    },
  },
  "fr-FR": {
    businessScripts: {
      dental_clinic: {
        question: "Avez-vous des disponibilités pour un détartrage cette semaine?",
        answer: "Je serais ravie de vous aider à planifier un détartrage. Laissez-moi vérifier notre agenda. Nous avons des créneaux jeudi à 14h et vendredi à 10h. Quel horaire vous convient le mieux?",
      },
      medical_practice: {
        question: "J'aimerais consulter le médecin pour des maux de tête persistants.",
        answer: "Je comprends. Je peux vous aider à prendre rendez-vous. Nous avons des disponibilités demain après-midi à 15h ou jeudi matin à 9h. L'un de ces créneaux vous conviendrait-il?",
      },
      salon: {
        question: "Puis-je réserver une coupe pour samedi?",
        answer: "Bien sûr! Laissez-moi consulter le planning de samedi. Nous avons des disponibilités à 11h et 14h30. Quelle heure préférez-vous?",
      },
      restaurant: {
        question: "Avez-vous une table pour quatre personnes ce soir?",
        answer: "Laissez-moi vérifier les disponibilités pour ce soir. Oui, nous avons une belle table disponible à 19h30. Souhaitez-vous que je la réserve?",
      },
      spa: {
        question: "J'aimerais réserver un massage pour le week-end.",
        answer: "Excellent choix! Nous avons une disponibilité samedi à 13h pour un massage relaxant de 60 minutes. Cela vous conviendrait-il?",
      },
      fitness: {
        question: "À quelle heure sont vos cours du matin?",
        answer: "Nous proposons plusieurs options le matin! Yoga à 6h, spinning à 7h et HIIT à 8h. Puis-je vous inscrire?",
      },
      other: {
        question: "Quels sont vos horaires d'ouverture?",
        answer: "Nous sommes ouverts du lundi au vendredi de 9h à 18h, et le samedi de 10h à 16h. Souhaitez-vous prendre rendez-vous?",
      },
    },
    toneAdjustments: {
      professional: { greeting: "Bonjour, merci d'appeler", closing: "Puis-je vous aider avec autre chose?" },
      friendly: { greeting: "Bonjour! Merci beaucoup d'appeler", closing: "Y a-t-il autre chose que je puisse faire pour vous?" },
      casual: { greeting: "Salut! Merci d'appeler", closing: "Autre chose?" },
    },
  },
  "es-ES": {
    businessScripts: {
      dental_clinic: {
        question: "¿Tienen alguna cita disponible para una limpieza esta semana?",
        answer: "Con mucho gusto le ayudo a programar una limpieza dental. Déjeme revisar nuestra agenda. Tenemos disponibilidad el jueves a las 14:00 y el viernes a las 10:00. ¿Qué horario le viene mejor?",
      },
      medical_practice: {
        question: "Necesito ver al médico por un dolor de cabeza persistente.",
        answer: "Lo entiendo. Puedo ayudarle a concertar una cita. Tenemos disponibilidad mañana por la tarde a las 15:00, o el jueves por la mañana a las 9:00. ¿Le vendría bien alguno de estos horarios?",
      },
      salon: {
        question: "¿Puedo reservar un corte de pelo para el sábado?",
        answer: "¡Por supuesto! Déjeme revisar la agenda del sábado. Tenemos huecos a las 11:00 y a las 14:30. ¿Qué hora prefiere?",
      },
      restaurant: {
        question: "¿Tienen una mesa para cuatro disponible esta noche?",
        answer: "Déjeme comprobar la disponibilidad para esta noche. Sí, tenemos una mesa estupenda disponible a las 19:30. ¿Quiere que se la reserve?",
      },
      spa: {
        question: "Me gustaría reservar un masaje para el fin de semana.",
        answer: "¡Excelente elección! Tenemos disponibilidad el sábado a las 13:00 para un masaje relajante de 60 minutos. ¿Le vendría bien?",
      },
      fitness: {
        question: "¿A qué hora son las clases de la mañana?",
        answer: "¡Tenemos varias opciones por la mañana! Yoga a las 6:00, spinning a las 7:00 y HIIT a las 8:00. ¿Le reservo plaza?",
      },
      other: {
        question: "¿Cuál es su horario de atención?",
        answer: "Abrimos de lunes a viernes de 9:00 a 18:00, y los sábados de 10:00 a 16:00. ¿Desea concertar una cita?",
      },
    },
    toneAdjustments: {
      professional: { greeting: "Buenos días, gracias por llamar a", closing: "¿Hay algo más en lo que pueda ayudarle?" },
      friendly: { greeting: "¡Hola! Muchas gracias por llamar a", closing: "¿Puedo ayudarle con algo más?" },
      casual: { greeting: "¡Hola! Gracias por llamar a", closing: "¿Algo más?" },
    },
  },
  "it-IT": {
    businessScripts: {
      dental_clinic: {
        question: "Avete disponibilità per una pulizia dentale questa settimana?",
        answer: "Sarò lieta di aiutarla a prenotare una pulizia dentale. Controllo la nostra agenda. Abbiamo disponibilità giovedì alle 14:00 e venerdì alle 10:00. Quale orario Le è più comodo?",
      },
      medical_practice: {
        question: "Vorrei vedere il dottore per un mal di testa persistente.",
        answer: "Capisco. Posso aiutarla a fissare un appuntamento. Abbiamo disponibilità domani pomeriggio alle 15:00 o giovedì mattina alle 9:00. Le andrebbe bene uno di questi orari?",
      },
      salon: {
        question: "Posso prenotare un taglio di capelli per sabato?",
        answer: "Certamente! Controllo l'agenda di sabato. Abbiamo disponibilità alle 11:00 e alle 14:30. Quale orario preferisce?",
      },
      restaurant: {
        question: "Avete un tavolo per quattro disponibile stasera?",
        answer: "Controllo la disponibilità per stasera. Sì, abbiamo un bellissimo tavolo disponibile alle 19:30. Vuole che glielo prenoti?",
      },
      spa: {
        question: "Vorrei prenotare un massaggio per il fine settimana.",
        answer: "Ottima scelta! Abbiamo disponibilità sabato alle 13:00 per un massaggio rilassante di 60 minuti. Le andrebbe bene?",
      },
      fitness: {
        question: "A che ora sono le lezioni del mattino?",
        answer: "Abbiamo diverse opzioni al mattino! Yoga alle 6:00, spinning alle 7:00 e HIIT alle 8:00. Vuole che La prenoti?",
      },
      other: {
        question: "Quali sono i vostri orari di apertura?",
        answer: "Siamo aperti dal lunedì al venerdì dalle 9:00 alle 18:00, e il sabato dalle 10:00 alle 16:00. Desidera fissare un appuntamento?",
      },
    },
    toneAdjustments: {
      professional: { greeting: "Buongiorno, grazie per aver chiamato", closing: "C'è altro in cui posso esserLe utile?" },
      friendly: { greeting: "Ciao! Grazie mille per aver chiamato", closing: "Posso aiutarLa con qualcos'altro?" },
      casual: { greeting: "Ciao! Grazie per aver chiamato", closing: "Altro?" },
    },
  },
  "pt-BR": {
    businessScripts: {
      dental_clinic: {
        question: "Vocês têm horário disponível para uma limpeza esta semana?",
        answer: "Terei prazer em ajudá-lo a agendar uma limpeza. Deixe-me verificar nossa agenda. Temos horários na quinta às 14h e na sexta às 10h. Qual horário fica melhor para você?",
      },
      medical_practice: {
        question: "Preciso consultar o médico sobre uma dor de cabeça persistente.",
        answer: "Entendo. Posso ajudá-lo a marcar uma consulta. Temos disponibilidade amanhã à tarde às 15h, ou quinta de manhã às 9h. Algum desses horários funciona para você?",
      },
      salon: {
        question: "Posso agendar um corte de cabelo para sábado?",
        answer: "Claro! Deixe-me verificar a agenda de sábado. Temos horários às 11h e às 14h30. Qual horário você prefere?",
      },
      restaurant: {
        question: "Vocês têm mesa para quatro pessoas disponível hoje à noite?",
        answer: "Deixe-me verificar a disponibilidade para esta noite. Sim, temos uma mesa ótima disponível às 19h30. Gostaria que eu reservasse?",
      },
      spa: {
        question: "Gostaria de reservar uma massagem para o fim de semana.",
        answer: "Ótima escolha! Temos disponibilidade no sábado às 13h para uma massagem relaxante de 60 minutos. Funciona para você?",
      },
      fitness: {
        question: "Que horas são as aulas da manhã?",
        answer: "Temos várias opções pela manhã! Yoga às 6h, spinning às 7h e HIIT às 8h. Gostaria que eu reservasse uma vaga?",
      },
      other: {
        question: "Quais são os horários de funcionamento?",
        answer: "Funcionamos de segunda a sexta das 9h às 18h, e sábados das 10h às 16h. Gostaria de agendar um horário?",
      },
    },
    toneAdjustments: {
      professional: { greeting: "Bom dia, obrigado por ligar para", closing: "Posso ajudá-lo com mais alguma coisa?" },
      friendly: { greeting: "Oi! Muito obrigado por ligar para", closing: "Mais alguma coisa que eu possa fazer por você?" },
      casual: { greeting: "Oi! Valeu por ligar para", closing: "Mais alguma coisa?" },
    },
  },
};

// Fallback to English for unsupported languages
function getLanguageScripts(languageCode: string) {
  // Try exact match first
  if (languageScripts[languageCode]) {
    return languageScripts[languageCode];
  }
  // Try language family (e.g., nl-BE -> nl-NL)
  const langPrefix = languageCode.split('-')[0];
  const familyMatch = Object.keys(languageScripts).find(key => key.startsWith(langPrefix));
  if (familyMatch) {
    return languageScripts[familyMatch];
  }
  // Default to English
  return languageScripts["en-US"];
}

function generateDemoScript(data: DemoRequest): string {
  const { businessName, businessType, services, tone, language = "en-US" } = data;
  const scripts = getLanguageScripts(language);
  const toneStyle = scripts.toneAdjustments[tone] || scripts.toneAdjustments.friendly;
  const businessScript = scripts.businessScripts[businessType] || scripts.businessScripts.other;

  // Build the demo script (~30 seconds when spoken)
  const demoScript = `
${toneStyle.greeting} ${businessName}. ${language.startsWith('en') ? "I'm your AI receptionist. How can I help you today?" : ""}

[pause]

${businessScript.answer}

${services ? `${language.startsWith('en') ? `By the way, we also offer ${services.split(',').slice(0, 2).join(' and ')}.` : ''}` : ''}

${toneStyle.closing}
  `.trim();

  return demoScript;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: DemoRequest = await req.json();
    console.log("Demo request received:", { 
      businessName: data.businessName, 
      businessType: data.businessType,
      voiceId: data.voiceId,
      language: data.language
    });

    // Validate required fields
    if (!data.businessName || !data.voiceId) {
      return new Response(
        JSON.stringify({ error: "Business name and voice are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate the demo script
    const script = generateDemoScript(data);
    console.log("Generated script:", script);

    // Get ElevenLabs API key
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Voice service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call ElevenLabs TTS API
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${data.voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("ElevenLabs API error:", ttsResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate audio" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert audio to base64 in chunks to avoid stack overflow
    const audioBuffer = await ttsResponse.arrayBuffer();
    const uint8Array = new Uint8Array(audioBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64Audio = btoa(binary);

    console.log("Audio generated successfully, size:", audioBuffer.byteLength);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        script: script,
        contentType: "audio/mpeg"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating demo:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});