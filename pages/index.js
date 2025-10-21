import Layout from '../src/components/Layout'


export default function Home() {
return (
<Layout>
<div className="p-6">
<h1 className="text-3xl font-bold mb-4">Dashboard (vazio)</h1>
<p className="text-muted mb-6">Este é um template fictício de dashboard — front-end apenas.</p>


<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="col-span-2">
<div className="h-64 rounded-lg border-2 border-dashed flex items-center justify-center">
<span>Área principal — gráficos / listas</span>
</div>
</div>
<div>
<div className="h-64 rounded-lg border-2 border-dashed flex items-center justify-center">
<span>Sidebar widget vazio</span>
</div>
</div>
</div>
</div>
</Layout>
)
}
