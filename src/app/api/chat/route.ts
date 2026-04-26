import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { verifyToken } from "@/lib/auth";
import { DEFAULT_LANGUAGE, INDIAN_LANGUAGE_VALUES, getLanguageOption } from "@/lib/indian-languages";
import { prisma } from "@/lib/prisma";
import { getUserWithSettings } from "@/lib/user-settings";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    const payload = verifyToken(token);

    const currentUser = await getUserWithSettings(payload.userId);

    const { chatId, message, language = DEFAULT_LANGUAGE } = await request.json();
    const selectedLanguage = INDIAN_LANGUAGE_VALUES.has(language) ? language : currentUser?.preferredLanguage || DEFAULT_LANGUAGE;
    const selectedLanguageOption = getLanguageOption(selectedLanguage);
    const scriptInstruction = selectedLanguageOption?.scriptInstruction ?? "English only.";

    if (!chatId || !message) {
      return NextResponse.json({ message: "Missing chatId or message." }, { status: 400 });
    }

    const userContext = currentUser
      ? `
    CURRENT USER'S PROFILE DATA:
    - Name: ${currentUser.name}
    - Email: ${currentUser.email}
    - Mobile: ${currentUser.mobile || "N/A"}
    - Preferred Language: ${currentUser.preferredLanguage || DEFAULT_LANGUAGE}
    - Registration Status: ${currentUser.registrationStatus}
    ${
      currentUser.registrationData
        ? (() => {
            const d = JSON.parse(currentUser.registrationData);
            return `- Full Name on Form: ${d.fullName || "N/A"}
    - Date of Birth: ${d.dob || "N/A"}
    - Gender: ${d.gender || "N/A"}
    - Address: ${[d.houseNo, d.area, d.city, d.state, d.pincode].filter(Boolean).join(", ") || "N/A"}
    - Duration of Stay: ${d.durationOfStay || "N/A"}
    - Aadhaar: ${d.aadhaar ? "Provided" : "Not Provided"}
    - Relative Name: ${d.familyRelativeName || "N/A"}
    - Mobile: ${d.mobile || "N/A"}`;
          })()
        : "- Registration Form: Not yet submitted"
    }
    `
      : "";

    await prisma.message.create({
      data: {
        role: "user",
        content: message,
        chatId,
      },
    });

    const previousMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    const ragContext = `
    KNOWLEDGE BASE (VoteEasy Project & Indian Voting Rules):
    1. Eligibility Criteria to be a Voter in India:
       - Be a citizen of India
       - Be at least 18 years old (on the qualifying date)
       - Be of sound mind (not declared mentally unfit by a court)
       - Not be disqualified by law (for example due to certain criminal offenses or corrupt practices)
       - Be ordinarily resident of the constituency where applying
    2. Information Required for Voter Registration (Form 6):
       - Personal Details: Full name, Date of birth or age, Gender
       - Address Details: Current residential address, Duration of stay
       - Family Details: Name of father, mother, or husband
       - Identification Details: Aadhaar number (optional but helpful), Mobile number and email ID
       - Documents Upload: Proof of age, Proof of address, Passport size photograph
    3. The platform is named "VoteEasy" and helps users fill out Form 6 online, track deadlines, and verify eligibility.

    ${userContext}

    STRICT INSTRUCTIONS:
    - You are the VoteEasy RAG Chatbot.
    - You MUST ONLY answer questions related to voting in India, voter registration, Form 6, election deadlines in India, and the VoteEasy platform.
    - When a user asks about their own data, use the CURRENT USER'S PROFILE DATA above to answer accurately.
    - CRITICAL LANGUAGE RULE: You MUST write your entire response in ${selectedLanguage}. ${
      selectedLanguage === "English" ? "Use clear English only." : `Use only ${scriptInstruction}`
    } Never use Roman transliteration.
    - If the user asks a question unrelated to voting in India or the VoteEasy project, refuse in ${selectedLanguage} and say that you can only answer questions about voting in India and the VoteEasy platform.
    `;

    const languagePrefix =
      selectedLanguage !== "English"
        ? `[IMPORTANT: Reply ONLY in ${selectedLanguage}. Use only ${scriptInstruction} Do NOT use Roman or English transliteration at all.]\n\n`
        : "[IMPORTANT: Reply only in English.]\n\n";

    const messagesForApi = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    if (messagesForApi.length > 0 && messagesForApi[messagesForApi.length - 1].role === "user") {
      messagesForApi[messagesForApi.length - 1].content = languagePrefix + messagesForApi[messagesForApi.length - 1].content;
    }

    const apiMessages = [{ role: "system", content: ragContext }, ...messagesForApi];

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: apiMessages,
        temperature: 0.5,
        max_tokens: 600,
      }),
    });

    if (!groqRes.ok) {
      console.error("Groq API error", await groqRes.text());
      throw new Error("Failed to fetch from Groq API");
    }

    const groqData = await groqRes.json();
    const aiResponseContent = groqData.choices[0].message.content;

    const aiMessage = await prisma.message.create({
      data: {
        role: "assistant",
        content: aiResponseContent,
        chatId,
      },
    });

    if (previousMessages.length === 1) {
      const titleRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: `Generate a very short 2-4 word title for this prompt: "${message}". Do not include quotes or extra text.`,
            },
          ],
          temperature: 0.3,
          max_tokens: 15,
        }),
      });

      if (titleRes.ok) {
        const titleData = await titleRes.json();
        const generatedTitle = titleData.choices[0].message.content.replace(/["']/g, "").trim();
        await prisma.chat.update({
          where: { id: chatId },
          data: { title: generatedTitle },
        });
      }
    } else {
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ message: aiMessage }, { status: 200 });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ message: "Failed to process chat." }, { status: 500 });
  }
}
