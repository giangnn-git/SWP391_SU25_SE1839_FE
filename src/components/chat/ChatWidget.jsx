import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Search } from "lucide-react";
import axios from "../../services/axios.customize";

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [input, setInput] = useState("");
    const [query, setQuery] = useState("");
    const messagesEndRef = useRef(null);

    const parseJwt = (token) => {
        try {
            if (!token) return null;
            const base64Url = token.split(".")[1];
            if (!base64Url) return null;
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    };

    const token = localStorage.getItem("token");
    const user = parseJwt(token);
    const isLoggedIn = !!token;
    const role = user?.role ?? null;
    const currentUserId = user?.userId ?? user?.id ?? null;

    const scrollBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 80);
    };

    useEffect(() => {
        if (!isLoggedIn || !open) return;
        const loadConversations = async () => {
            try {
                const res = await axios.get("/api/api/conversations");
                let convs = res.data?.data ?? [];
                if (role === "TECHNICIAN" && currentUserId) {
                    convs = convs.filter((c) => {
                        const techId = c.technicianId ?? c.technician?.id;
                        return String(techId) === String(currentUserId);
                    });
                }
                setConversations(convs);
            } catch (e) {
                console.error(e);
            }
        };
        loadConversations();
    }, [isLoggedIn, role, currentUserId, open]);

    useEffect(() => {
        if (!isLoggedIn || (role !== "SC_STAFF" && role !== "STAFF") || !open) return;
        const loadTechs = async () => {
            try {
                const res = await axios.get("/api/auth/service-centers/technicians");
                setTechnicians(res.data?.data ?? []);
            } catch (e) {
                console.error(e);
            }
        };
        loadTechs();
    }, [isLoggedIn, role, open]);

    const openConversation = async (conv) => {
        try {
            const res = await axios.get(`/api/api/messages/${conv.id}`);
            let msgs = res.data?.data ?? res.data ?? [];
            if (msgs && msgs.messages) msgs = msgs.messages;
            if (!Array.isArray(msgs)) msgs = [];

            const norm = msgs.map((m) => ({
                id: m.id ?? m._id ?? `${m.senderId || "x"}_${Math.random()}`,
                content: m.content ?? m.message ?? m.text ?? "",
                timestamp: m.timestamp ?? m.createdAt ?? m.time ?? null,
                senderId: m.senderId ?? m.userId ?? m.sender?.id ?? null,
                me: !!m.me,
                raw: m,
            }));

            const updated = { ...conv, messages: norm };
            setConversations((prev) =>
                prev.map((c) => (c.id === conv.id ? updated : c))
            );
            setSelectedConv(updated);
            setOpen(true);
            setTimeout(scrollBottom, 120);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (selectedConv?.messages?.length) scrollBottom();
    }, [selectedConv?.messages]);

    const startConversationWithTech = async (tech) => {
        if (role !== "SC_STAFF" && role !== "STAFF") return;
        try {
            const res = await axios.post("/api/api/conversations/start", {
                technicianId: tech.id,
            });
            const convId = res.data?.data?.conversationId ?? res.data;
            const reload = await axios.get("/api/api/conversations");
            const convs = reload.data?.data ?? [];
            setConversations(convs);
            const started = convs.find((c) => c.id === convId);
            if (started) openConversation(started);
        } catch (e) {
            console.error(e);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !selectedConv || !isLoggedIn) return;
        if (!role || (role !== "SC_STAFF" && role !== "STAFF" && role !== "TECHNICIAN")) {
            console.error("Unauthorized role");
            return;
        }

        try {
            const res = await axios.post("/api/api/messages", {
                conversationId: selectedConv.id,
                message: input.trim(),
            });

            const newMsg = res.data?.data ?? res.data;
            const updated = {
                ...selectedConv,
                messages: [...(selectedConv.messages || []), newMsg],
            };

            setSelectedConv(updated);
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === selectedConv.id
                        ? { ...c, messages: updated.messages, lastMessage: newMsg }
                        : c
                )
            );
            setInput("");
        } catch (e) {
            console.error(e);
        }
    };

    const getCounterpartName = (c) => {
        if (!c || !currentUserId) return "Unknown";
        if (c.staff?.id === currentUserId) return c.technician?.name || "No name";
        return c.staff?.name || "No name";
    };

    const filteredConversations = conversations.filter((c) =>
        (getCounterpartName(c) || "").toLowerCase().includes(query.toLowerCase())
    );

    const isStaff = role === "SC_STAFF" || role === "STAFF";
    const filteredTechs = isStaff
        ? technicians.filter((t) =>
            (t.name || "").toLowerCase().includes(query.toLowerCase())
        )
        : [];

    return (
        <div className="fixed right-4 bottom-4 z-[99999]">
            <div className="flex flex-col items-end">
                {open && isLoggedIn && (
                    <div className="w-80 sm:w-96 md:w-[420px] bg-white shadow-xl rounded-xl overflow-hidden mb-3 border border-gray-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
                            <div className="flex items-center gap-3">
                                <MessageCircle size={18} />
                                <div>
                                    <div className="text-sm font-medium">Tin nhắn nội bộ</div>
                                    <div className="text-xs text-white/80">Staff ↔ Technician</div>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} className="p-1">
                                <X />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex h-[420px]">
                            {/* Left list */}
                            <div className="w-44 border-r border-gray-200 flex flex-col">
                                <div className="p-2">
                                    <div className="relative">
                                        <Search
                                            size={14}
                                            className="absolute left-2 top-2 text-gray-400"
                                        />
                                        <input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Tìm cuộc trò chuyện"
                                            className="w-full pl-8 pr-2 py-1 text-xs rounded-lg border border-gray-200"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-auto flex-1">
                                    <ul className="p-1">
                                        {filteredConversations.map((c) => {
                                            const name = getCounterpartName(c);
                                            const last = c.lastMessage;
                                            return (
                                                <li
                                                    key={c.id}
                                                    onClick={() => openConversation(c)}
                                                    className="p-2 flex items-start gap-2 cursor-pointer hover:bg-gray-50"
                                                >
                                                    <div className="h-9 w-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                                                        {name?.[0] ?? "?"}
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-xs">
                                                        <div className="flex justify-between">
                                                            <div className="font-medium truncate">{name}</div>
                                                            <div className="text-[11px] text-gray-400">
                                                                {last
                                                                    ? new Date(
                                                                        last.timestamp
                                                                    ).toLocaleTimeString([], {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })
                                                                    : ""}
                                                            </div>
                                                        </div>
                                                        <div className="text-gray-400 text-[11px] truncate">
                                                            {last?.content ?? "Nhấn để mở"}
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {isStaff && (
                                        <>
                                            <div className="p-2 border-t text-xs text-gray-500">
                                                Bắt đầu cuộc trò chuyện mới
                                            </div>
                                            <ul className="p-1">
                                                {filteredTechs.map((t) => (
                                                    <li
                                                        key={t.id}
                                                        onClick={() => startConversationWithTech(t)}
                                                        className="p-2 flex items-start gap-2 cursor-pointer hover:bg-gray-50"
                                                    >
                                                        <div className="h-9 w-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                                                            {t.name?.[0] ?? "?"}
                                                        </div>
                                                        <div className="flex-1 min-w-0 text-xs">
                                                            <div className="font-medium truncate">{t.name}</div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right chat window */}
                            <div className="flex-1 flex flex-col bg-gray-50">
                                <div className="py-2 px-3 border-b text-sm font-medium">
                                    {selectedConv
                                        ? getCounterpartName(selectedConv)
                                        : "Chọn cuộc trò chuyện"}
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-auto p-3 space-y-3">
                                    {selectedConv &&
                                        selectedConv.messages?.map((m) => {
                                            const content =
                                                m.content ?? m.message ?? m.text ?? "";
                                            const ts =
                                                m.timestamp ?? m.createdAt ?? m.time ?? null;
                                            const senderId = m.senderId;
                                            const isMine =
                                                String(senderId) === String(currentUserId);

                                            return (
                                                <div
                                                    key={m.id || Math.random()}
                                                    className={`flex flex-col ${isMine ? "items-end" : "items-start"} w-full`}
                                                >
                                                    <div
                                                        className={`px-3 py-2 rounded-2xl max-w-[80%] text-sm break-words shadow ${isMine
                                                            ? "bg-blue-600 text-white rounded-br-none"
                                                            : "bg-white text-gray-800 rounded-bl-none"
                                                            }`}
                                                    >
                                                        {content}
                                                    </div>
                                                    <div className="text-[11px] mt-1 text-gray-400">
                                                        {ts
                                                            ? new Date(ts).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })
                                                            : ""}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-3 border-t bg-white">
                                    <div className="flex items-center gap-2">
                                        <input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            disabled={!selectedConv}
                                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                            placeholder="Nhập tin nhắn..."
                                            className="flex-1 px-3 py-2 rounded-full border"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!selectedConv || !input.trim()}
                                            className="p-2 bg-blue-600 text-white rounded-full"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating button */}
                <button
                    onClick={() => {
                        if (!isLoggedIn) return (window.location.href = "/login");
                        setOpen((s) => !s);
                    }}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
                >
                    <MessageCircle size={20} />
                </button>
            </div>
        </div>
    );
};

export default ChatWidget;
