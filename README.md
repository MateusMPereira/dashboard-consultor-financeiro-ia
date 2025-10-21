# nextjs-dashboard-empty


Scaffold mínimo de front-end Next.js + Tailwind para um dashboard fictício.


## Rodando localmente (dev)


1. `npm install`
2. `npm run dev`
3. Acesse `http://localhost:3000`


## Build e rodar com Docker (produção)


1. `docker build -t nextjs-dashboard-empty .`
2. `docker run -p 3000:3000 nextjs-dashboard-empty`


O container roda `next start` em modo produção.
```


---


> Observação: esse projeto é propositalmente simples e pronto para você expandir — adicionar gráficos (recharts, chart.js), chamadas à API, autenticação, etc. Se quiser eu gero também um `docker-compose.yml`, ou incluo exemplos de widgets com dados fictícios.
