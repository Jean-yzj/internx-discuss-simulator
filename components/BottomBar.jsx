import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./BottomBar.module.css";

const TABS = [
    { href: "/", icon: "chat-1", label: "話題", match: ["/"] },
    { href: "/polls", icon: "bar-chart-grouped", label: "投票", match: ["/polls"] },
    { href: "/experts", icon: "vip-crown", label: "專家", match: ["/experts", "/u/", "/brands/"] },
    { href: "/saved", icon: "bookmark", label: "收藏", match: ["/saved"] },
    { href: "/settings", icon: "user", label: "我的", match: ["/settings"] },
];

export default function BottomBar({ unreadNotifications = 0 }) {
    const router = useRouter();
    const path = router.pathname;
    const isActive = (tab) => {
        if (tab.href === "/" && path === "/") return true;
        return tab.match.some((m) => m !== "/" && path.startsWith(m));
    };

    return (
        <nav className={styles.bar} aria-label="主要導航">
            {TABS.map((tab) => {
                const active = isActive(tab);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`${styles.tab} ${active ? styles.tabActive : ""}`}
                        style={{ position: "relative" }}
                    >
                        <i className={`ri-${tab.icon}-${active ? "fill" : "line"}`} />
                        <span>{tab.label}</span>
                        {tab.icon === "user" && unreadNotifications > 0 && (
                            <span className={styles.tabBadge}>{unreadNotifications}</span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
