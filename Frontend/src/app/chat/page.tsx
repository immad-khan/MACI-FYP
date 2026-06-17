"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Sparkles,
  Paperclip,
  SlidersHorizontal,
  LayoutGrid,
  Mic,
  Send,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const sidebarSections: {
  title: string;
  items: { icon: typeof MessageSquare; label: string; active?: boolean }[];
}[] = [
  {
    title: "Features",
    items: [{ icon: MessageSquare, label: "Chat", active: true }],
  },
  {
    title: "Workspaces",
    items: [{ icon: Sparkles, label: "Riset" }],
  },
];



const agentOptions = [
  { label: "Master", value: "master" },
  { label: "Writer", value: "writer" },
  { label: "Verifier", value: "verifier" },
  { label: "Optimizer", value: "optimizer" },
];

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("master");
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I'm analyzing your request with the ${selectedAgent} agent. The team will collaboratively generate, verify, and optimize the solution for you.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0f]">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 z-50 h-full w-[260px] border-r border-[#1e1e3a] bg-[#0f0f1a] p-4 lg:static lg:translate-x-0 ${sidebarOpen ? "block" : "hidden lg:block"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6c63ff]">
                <span className="font-mono text-[14px] font-bold text-white">M</span>
              </div>
              <span className="font-serif text-[20px] font-semibold text-[#f0f0ff]">MACI</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8b8ba7] lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <button className="mt-6 flex h-10 w-full items-center gap-2 rounded-[10px] bg-[#141428] px-3 text-[14px] font-medium text-[#f0f0ff] transition-colors hover:bg-[#1e1e3a]">
            <Plus size={16} />
            New Chat
          </button>

          <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <p className="px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#4a4a6a]">
                  {section.title}
                </p>
                <ul className="mt-2 space-y-1">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <button
                        className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] transition-colors ${item.active ? "bg-[rgba(108,99,255,0.12)] text-[#6c63ff]" : "text-[#8b8ba7] hover:bg-[#141428] hover:text-[#f0f0ff]"}`}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-4 flex items-center justify-between border-t border-[#1e1e3a] pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e1e3a]">
                <span className="text-[12px] font-semibold text-[#f0f0ff]">U</span>
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#f0f0ff]">User</p>
                <p className="text-[11px] text-[#4a4a6a]">Free plan</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8b8ba7] transition-colors hover:bg-[#141428] hover:text-[#f0f0ff]"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-[#1e1e3a] bg-[#0a0a0f]/80 px-4 backdrop-blur-[20px] sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8b8ba7] hover:bg-[#141428] lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                className="flex items-center gap-2 rounded-[10px] bg-[#141428] px-3 py-2 text-[13px] font-medium text-[#f0f0ff] transition-colors hover:bg-[#1e1e3a]"
              >
                <span className="font-mono text-[#6c63ff]">
                  {agentOptions.find((a) => a.value === selectedAgent)?.label}
                </span>
                <ChevronDown size={14} className="text-[#8b8ba7]" />
              </button>

              <AnimatePresence>
                {showAgentDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 top-full z-30 mt-2 w-40 overflow-hidden rounded-[12px] border border-[#1e1e3a] bg-[#141428] py-1 shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
                  >
                    {agentOptions.map((agent) => (
                      <button
                        key={agent.value}
                        onClick={() => {
                          setSelectedAgent(agent.value);
                          setShowAgentDropdown(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${selectedAgent === agent.value ? "bg-[rgba(108,99,255,0.12)] text-[#6c63ff]" : "text-[#8b8ba7] hover:bg-[#1e1e3a] hover:text-[#f0f0ff]"}`}
                      >
                        <span className="font-mono">{agent.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-3" />
        </header>

        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              {/* Orb */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  filter: [
                    "drop-shadow(0 0 30px rgba(108,99,255,0.3))",
                    "drop-shadow(0 0 50px rgba(108,99,255,0.5))",
                    "drop-shadow(0 0 30px rgba(108,99,255,0.3))",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-24 w-24"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6c63ff] via-[#4c3fe3] to-[#1e1e3a] opacity-90" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#8b7bff] to-[#6c63ff] opacity-60 blur-sm" />
                <div className="absolute -inset-4 rounded-full bg-[#6c63ff] opacity-20 blur-xl" />
              </motion.div>

              <h2 className="mt-8 text-center text-[28px] font-semibold text-[#f0f0ff] sm:text-[36px]">
                Ready to Create Something New?
              </h2>
              <p className="mt-2 text-center text-[14px] text-[#8b8ba7]">
                Describe your problem and let MACI&apos;s agents collaborate.
              </p>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 pb-24">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[16px] px-4 py-3 sm:max-w-[75%] ${message.role === "user" ? "bg-[#6c63ff] text-white" : "border border-[#1e1e3a] bg-[#141428] text-[#f0f0ff]"}`}
                  >
                    <p className="text-[14px] leading-relaxed">{message.content}</p>
                    <p className="mt-1 text-[10px] opacity-60">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 rounded-[16px] border border-[#1e1e3a] bg-[#141428] px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                          className="h-2 w-2 rounded-full bg-[#6c63ff]"
                        />
                      ))}
                    </div>
                    <span className="text-[12px] text-[#8b8ba7]">MACI is thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-[#1e1e3a] bg-[#0a0a0f]/90 px-4 pb-6 pt-4 backdrop-blur-[20px]">
          <div className="mx-auto w-full max-w-3xl">
            <div className="relative rounded-[20px] border border-[#1e1e3a] bg-[#141428] p-3 transition-all focus-within:border-[#6c63ff] focus-within:shadow-[0_0_0_2px_rgba(108,99,255,0.15)]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Anything..."
                rows={1}
                className="min-h-[44px] w-full resize-none bg-transparent px-2 py-2.5 text-[15px] text-[#f0f0ff] outline-none placeholder:text-[#4a4a6a]"
                style={{ maxHeight: "160px" }}
              />

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8b8ba7] transition-colors hover:bg-[#1e1e3a] hover:text-[#f0f0ff]" aria-label="Attach file">
                    <Paperclip size={16} />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8b8ba7] transition-colors hover:bg-[#1e1e3a] hover:text-[#f0f0ff]" aria-label="Settings">
                    <SlidersHorizontal size={16} />
                  </button>
                  <button className="hidden h-8 w-8 items-center justify-center rounded-lg text-[#8b8ba7] transition-colors hover:bg-[#1e1e3a] hover:text-[#f0f0ff] sm:flex" aria-label="Options">
                    <LayoutGrid size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e1e3a] text-[#8b8ba7] transition-colors hover:bg-[#2a2a4a] hover:text-[#f0f0ff]" aria-label="Voice input">
                    <Mic size={16} />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6c63ff] text-white transition-all hover:bg-[#7b73ff] disabled:opacity-50 disabled:hover:bg-[#6c63ff]"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-2 text-center text-[11px] text-[#4a4a6a]">
              MACI agents may produce inaccurate code. Always review before deploying.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
