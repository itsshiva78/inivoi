import { useMemo } from "react";

// Next
import Link from "next/link";

// Assets

// ShadCn
import { Card } from "@/components/ui/card";

// Components
import { DevDebug, LanguageSelector, ThemeSwitcher } from "@/app/components";

const BaseNavbar = () => {
    const devEnv = useMemo(() => {
        return process.env.NODE_ENV === "development";
    }, []);

    return (
        <header className="lg:container z-[99]">
            <nav>
                <Card className="flex flex-wrap justify-between items-center px-8 py-5 gap-5">
                    <Link href={"/"}>
                        <h1 className="text-5xl font-bold tracking-tight">
                            Invoify
                        </h1>
                    </Link>

                    <div className="flex items-center gap-5">
                        <LanguageSelector />
                        <ThemeSwitcher />
                    </div>
                </Card>
            </nav>
        </header>
    );
};

export default BaseNavbar;
