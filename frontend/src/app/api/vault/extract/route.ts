import { NextRequest, NextResponse } from 'next/server';

function classifyReceiptType(str: string): 'Hotel' | 'Restaurant' | 'Transport' | 'Ticket' | 'Other' {
  const lower = (str || '').toLowerCase();
  if (/\b(hotel|resort|stay|inn|suites|room|airbnb|lodge|booking|agoda|taj|marriott|hilton|hyatt|hostel)\b/.test(lower)) {
    return 'Hotel';
  }
  if (/\b(restaurant|cafe|dining|food|bistro|bar|pizzeria|diner|zomato|swiggy|mcdonald|starbucks|menu|bill|coffee|eatery|dinner|lunch|breakfast|bakery)\b/.test(lower)) {
    return 'Restaurant';
  }
  if (/\b(flight|airline|indigo|air|train|irctc|rail|metro|bus|uber|ola|cab|taxi|transport|boarding|flight-ticket|express|seat|pnr)\b/.test(lower)) {
    return 'Transport';
  }
  if (/\b(ticket|museum|entry|pass|fort|monument|attraction|park|tour|monument-entry|zoo|aquarium|cinema|movie|show)\b/.test(lower)) {
    return 'Ticket';
  }
  return 'Other';
}

export async function POST(req: NextRequest) {
  try {
    const { fileBase64, mimeType, fileName } = await req.json();

    if (!fileBase64) {
      return NextResponse.json({ error: 'Receipt base64 data required' }, { status: 400 });
    }

    const initialType = classifyReceiptType(fileName || '');
    let extractedData = {
      title: fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Travel Document',
      type: initialType !== 'Other' ? initialType : 'Restaurant', // default smart fallback
      date: new Date().toISOString().split('T')[0],
      destination: 'Not detected',
      amount: 'Not detected',
      currency: 'INR',
      reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Stored safely in Travel Vault.'
    };

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const cleanBase64 = fileBase64.includes('base64,') ? fileBase64.split('base64,')[1] : fileBase64;
        const actualMime = mimeType || 'image/png';

        const prompt = `
Examine this travel receipt or document carefully.
Extract structured details and output JSON ONLY with exact format:
{
  "title": "Vendor or venue name e.g. Taj Hotel, Starbucks Cafe, Qutub Minar Entry Ticket, IndiGo Flight",
  "type": "Hotel" | "Restaurant" | "Ticket" | "Transport" | "Other",
  "date": "Date YYYY-MM-DD (or 'Not detected')",
  "destination": "City e.g. Delhi, Mumbai, Tokyo (or 'Not detected')",
  "amount": "Total amount with currency symbol e.g. ₹2,400 or $45 (or 'Not detected')",
  "currency": "Currency code e.g. INR / USD (or 'Not detected')",
  "reference": "PNR / Invoice # (or 'Not detected')",
  "notes": "Short summary of transaction"
}

IMPORTANT TYPE CLASSIFICATION RULES:
- If it is hotel, resort, lodge, stay, or airbnb -> "type" MUST BE "Hotel"
- If it is restaurant, cafe, food bill, dining, swiggy, zomato, bakery -> "type" MUST BE "Restaurant"
- If it is flight, train, bus, cab, taxi, subway, metro ticket -> "type" MUST BE "Transport"
- If it is museum, monument, park, theme park, attraction entry ticket -> "type" MUST BE "Ticket"
- Otherwise -> "type" MUST BE "Other"

Do NOT classify restaurant or hotel receipts as Ticket. Output valid JSON only without markdown formatting.
`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { inline_data: { mime_type: actualMime, data: cleanBase64 } },
                  { text: prompt }
                ]
              }]
            })
          }
        );

        if (res.ok) {
          const gData = await res.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed && typeof parsed === 'object') {
            extractedData = { ...extractedData, ...parsed };
          }
        }
      } catch (gErr) {
        console.warn('Gemini extraction error in API route:', gErr);
      }
    }

    return NextResponse.json({ success: true, extractedData });
  } catch (err: any) {
    console.error('Error in vault extract route:', err);
    return NextResponse.json({ error: 'Failed to extract receipt data' }, { status: 500 });
  }
}
