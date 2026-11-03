import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bell,
  ChevronRight,
  Eye,
  FileText,
  Globe,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  UserRound,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";

const supportUrl = "https://wa.me/244923000000";

function Contents({ close, profile, toggleSetting }) {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await authApi.signOut();
      close();
      navigate({ to: "/login" });
    } catch (error) {
      window.alert(error.message);
    }
  };
  return (
    <div className="space-y-1 p-2 text-sm">
      <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Definições
      </p>
      <Link
        to="/perfil"
        onClick={close}
        className="flex min-h-11 items-center gap-3 rounded-xl px-3 hover:bg-accent"
      >
        <UserRound className="size-4" /> Perfil do organizador{" "}
        <ChevronRight className="ml-auto size-4" />
      </Link>
      <Link
        to="/definicoes"
        onClick={close}
        className="flex min-h-11 items-center gap-3 rounded-xl px-3 hover:bg-accent"
      >
        <Globe className="size-4" /> Idioma, notificações, tema e palavra-passe
      </Link>
      {profile && toggleSetting && (
        <section className="my-2 space-y-1 border-y border-border py-2">
          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Preferências do perfil
          </p>
          {[
            {
              key: "notifications",
              label: "Notificações de vendas",
              icon: Bell,
            },
            { key: "publicProfile", label: "Perfil público", icon: Eye },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="switch"
              aria-label={label}
              aria-checked={profile[key]}
              onClick={() => toggleSetting(key)}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-accent"
            >
              <Icon className="size-4" />
              <span className="flex-1">{label}</span>
              <span
                className={`h-6 w-11 rounded-full p-0.5 transition-colors ${profile[key] ? "grad-primary" : "bg-surface-2"}`}
              >
                <span
                  className={`block size-5 rounded-full bg-card transition-transform ${profile[key] ? "translate-x-5" : ""}`}
                />
              </span>
            </button>
          ))}
        </section>
      )}
      <a
        href={supportUrl}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-11 items-center gap-3 rounded-xl px-3 hover:bg-accent"
      >
        <MessageSquare className="size-4" /> Ajuda e suporte
      </a>
      <Link
        to="/termos"
        onClick={close}
        className="flex min-h-11 items-center gap-3 rounded-xl px-3 hover:bg-accent"
      >
        <FileText className="size-4" /> Termos e condições
      </Link>
      <Link
        to="/privacidade"
        onClick={close}
        className="flex min-h-11 items-center gap-3 rounded-xl px-3 hover:bg-accent"
      >
        <Shield className="size-4" /> Política de privacidade
      </Link>
      <div className="my-1 border-t border-border" />
      <button
        onClick={logout}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-red-600 hover:bg-red-50"
      >
        <LogOut className="size-4" /> Terminar sessão
      </button>
    </div>
  );
}

export function AccountMenu({ profile, toggleSetting }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger
        aria-label="Abrir definições da conta"
        className="grid size-9 place-items-center rounded-full text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Settings className="size-5" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={10}
          align="end"
          collisionPadding={8}
          className="z-50 w-[min(20rem,calc(100vw-1rem))] rounded-2xl border border-border bg-popover p-1 shadow-xl animate-in fade-in slide-in-from-top-2"
        >
          <Contents close={() => setOpen(false)} profile={profile} toggleSetting={toggleSetting} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
