# Texto de integração — StatLab Experiments no portfólio

**Destino:** https://barujafe.vercel.app/  
**Uso:** colar este bloco como instrução para a IA/agente que edita o repositório do portfólio.

---

## Instrução para a IA do portfólio

Você vai integrar o projeto **StatLab Experiments** no portfólio existente de Felipe Alirio Baruja.

### Regras obrigatórias de preservação

1. **NÃO redesenhe** o site. Preserve o padrão visual, tipográfico, estrutural e editorial já existente.
2. **NÃO altere** hero, navegação, sobre, ou o layout geral da seção de projetos — apenas **insira um novo card** no grid/lista de projetos, seguindo o mesmo componente/padrão dos cards atuais (DataFlow, Maestro, Lança Ensaio, etc.).
3. Mantenha idioma, tom e hierarquia editorial do portfólio (PT-BR).
4. Não introduza dependências novas nem mude o design system.
5. Se o portfólio usa um array/config de projetos, adicione uma entrada ali; se usa arquivos por projeto, espelhe a estrutura existente.

### Dados do projeto a inserir

| Campo | Valor |
|---|---|
| Nome | StatLab Experiments |
| Descrição curta | Planejamento e interpretação de testes A/B com rigor estatístico e decisão em três estados (Vencedor, Inconclusivo, Efeito Fraco). |
| Stack (tags) | Next.js, TypeScript, Flask, SciPy, statsmodels, Vercel |
| Demo URL | https://frontend-gamma-blush-15.vercel.app |
| GitHub URL | https://github.com/BarujaFe1/StatLab-Experiments |
| Ano | 2026 |
| Categoria | Produto de dados / Experimentação |

### CTAs do card

- **Demo** (primário): abre `https://frontend-gamma-blush-15.vercel.app`
- **GitHub** (secundário): abre `https://github.com/BarujaFe1/StatLab-Experiments`

Ambos em nova aba (`target="_blank"` + `rel="noopener noreferrer"`), no mesmo padrão dos outros cards.

### Copy sugerida (adaptar ao comprimento dos cards existentes)

> **StatLab Experiments**  
> Ferramenta web frequentista para planejar tamanho amostral, analisar testes A/B e interpretar resultados com guardrails de relevância prática — não só p-valor.

### Imagem

- Preferir screenshot real da UI (aba Analisar com status Vencedor).
- Se o asset ainda não existir no repo do portfólio, use o mesmo fallback/placeholder que os outros projetos usam até a imagem ser adicionada em `/projects/statlab-experiments/` (ou caminho equivalente do repo).

### Critério de pronto

- [ ] Card visível na seção de projetos, no mesmo estilo dos demais.
- [ ] Links Demo e GitHub funcionando.
- [ ] Nenhuma regressão visual no restante do portfólio.
- [ ] Build/lint do portfólio passando.

### Referência técnica (contexto, não precisa expor no card)

- Backend: https://statlab-experiments-api.vercel.app  
- Handoff completo: arquivo `portfolio-project-handoff.md` no repositório StatLab-Experiments.
