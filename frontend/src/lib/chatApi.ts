import {apiFetch} from "@/lib/api";

export async function convertAudioToText(blob: Blob): Promise<string | undefined> {
    const formData = new FormData();
    formData.append("audio_file", blob, "recording.webm");

    const res = await apiFetch<{ text: string }>("/api/speech-to-text", {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        },
    })

    return res.text
}

export async function sendMessage(msg: string, sessionId: string | undefined): Promise<{
    response: string,
    session_id: string
}> {
    return await apiFetch<{
        response: string,
        session_id: string
    }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({
            message: msg,
            session_id: sessionId
        })
    })
}

export async function financialAdvice() :Promise<Record<string, any>> {
    return apiFetch<Record<string, any>>('/chat/advice/');

}