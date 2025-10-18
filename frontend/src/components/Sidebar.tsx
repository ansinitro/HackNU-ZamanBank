"use client";
import Link from "next/link";
import {User, Target, Bot, BarChart3, Menu} from "lucide-react";
import {usePathname} from "next/navigation";
import {useState, useEffect} from "react";

const links = [
    {href: "/", label: "Dashboard", icon: BarChart3},
    {href: "/profile", label: "Profile", icon: User},
    {href: "/aims", label: "Personal Aims", icon: Target},
    {href: "/chat", label: "AI Chat Bot", icon: Bot},
    {href: "/charts", label: "Expense/Income", icon: BarChart3},
];

export default function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [hasToken, setHasToken] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This runs only on the client side
        setIsClient(true);
        const token = localStorage.getItem("access_token");
        setHasToken(!!token);
    }, []);

    // Don't render anything until we're on the client
    if (!isClient) {
        return null;
    }

    // If no token, don't render the sidebar
    if (!hasToken) {
        return null;
    }

    return (
        <>
            <button
                className="md:hidden p-4 text-persianGreen"
                onClick={() => setOpen(!open)}
            >
                <Menu size={28}/>
            </button>

            {/* Sidebar */}
            <aside
                className={`bg-persianGreen text-white w-60 h-screen p-5 flex flex-col fixed top-0 left-0 z-40 transform transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 md:static
  `}
            >
                <h1 className="text-2xl font-bold mb-10 text-solar">Zaman Bank</h1>
                <nav className="space-y-3">
                    {links.map(({href, label, icon: Icon}) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 p-2 rounded-lg transition ${
                                pathname === href
                                    ? "bg-solar text-persianGreen font-semibold"
                                    : "hover:bg-green-700"
                            }`}
                            onClick={() => setOpen(false)} // close menu after click
                        >
                            <Icon className="w-5 h-5"/>
                            {label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Overlay (for mobile) */}
            {open && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    );
}