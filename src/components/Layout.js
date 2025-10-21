export default function Layout({ children }) {
return (
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
<header className="bg-white dark:bg-gray-800 shadow-sm">
<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
<div className="font-bold">Meu Dashboard</div>
<nav className="space-x-4 text-sm opacity-80">Usuário · Sair</nav>
</div>
</header>


<main className="max-w-7xl mx-auto px-4 py-6">{children}</main>


<footer className="text-center text-xs py-6 opacity-60">© {new Date().getFullYear()} — Dashboard vazio</footer>
</div>
)
}
