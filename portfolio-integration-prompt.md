> **SNAPSHOT HISTÓRICO (2026-07)** — Este documento registra o estado do projeto
> antes do hardening científico de 2026-08-21 (motor de 4 estados, IC Newcombe
> ajustado, contratos honestos de edge cases). Termos como "3 estados",
> "Vencedor", "FastAPI" e a URL legada refletem o contexto da época e NÃO
> descrevem o comportamento atual. Fontes de verdade atuais: README.md,
> docs/STATISTICAL_METHOD.md, docs/api-contract.md, docs/architecture-guardrails.md.

# Texto de integraÃƒÂ§ÃƒÂ£o Ã¢â‚¬â€ StatLab Experiments no portfÃƒÂ³lio

**Destino:** https://barujafe.vercel.app/  
**Uso:** colar este bloco como instruÃƒÂ§ÃƒÂ£o para a IA/agente que edita o repositÃƒÂ³rio do portfÃƒÂ³lio.

---

## InstruÃƒÂ§ÃƒÂ£o para a IA do portfÃƒÂ³lio

VocÃƒÂª vai integrar o projeto **StatLab Experiments** no portfÃƒÂ³lio existente de Felipe Alirio Baruja.

### Regras obrigatÃƒÂ³rias de preservaÃƒÂ§ÃƒÂ£o

1. **NÃƒÆ’O redesenhe** o site. Preserve o padrÃƒÂ£o visual, tipogrÃƒÂ¡fico, estrutural e editorial jÃƒÂ¡ existente.
2. **NÃƒÆ’O altere** hero, navegaÃƒÂ§ÃƒÂ£o, sobre, ou o layout geral da seÃƒÂ§ÃƒÂ£o de projetos Ã¢â‚¬â€ apenas **insira um novo card** no grid/lista de projetos, seguindo o mesmo componente/padrÃƒÂ£o dos cards atuais (DataFlow, Maestro, LanÃƒÂ§a Ensaio, etc.).
3. Mantenha idioma, tom e hierarquia editorial do portfÃƒÂ³lio (PT-BR).
4. NÃƒÂ£o introduza dependÃƒÂªncias novas nem mude o design system.
5. Se o portfÃƒÂ³lio usa um array/config de projetos, adicione uma entrada ali; se usa arquivos por projeto, espelhe a estrutura existente.

### Dados do projeto a inserir

| Campo | Valor |
|---|---|
| Nome | StatLab Experiments |
| DescriÃƒÂ§ÃƒÂ£o curta | Planejamento e interpretaÃƒÂ§ÃƒÂ£o de testes A/B com rigor estatÃƒÂ­stico e decisÃƒÂ£o em trÃƒÂªs estados (Vencedor, Inconclusivo, Efeito Fraco). |
| Stack (tags) | Next.js, TypeScript, Flask, SciPy, statsmodels, Vercel |
| Demo URL | https://statlab-ab.vercel.app |
| GitHub URL | https://github.com/BarujaFe1/StatLab-Experiments |
| Ano | 2026 |
| Categoria | Produto de dados / ExperimentaÃƒÂ§ÃƒÂ£o |

### CTAs do card

- **Demo** (primÃƒÂ¡rio): abre `https://statlab-ab.vercel.app`
- **GitHub** (secundÃƒÂ¡rio): abre `https://github.com/BarujaFe1/StatLab-Experiments`

Ambos em nova aba (`target="_blank"` + `rel="noopener noreferrer"`), no mesmo padrÃƒÂ£o dos outros cards.

### Copy sugerida (adaptar ao comprimento dos cards existentes)

> **StatLab Experiments**  
> Ferramenta web frequentista para planejar tamanho amostral, analisar testes A/B e interpretar resultados com guardrails de relevÃƒÂ¢ncia prÃƒÂ¡tica Ã¢â‚¬â€ nÃƒÂ£o sÃƒÂ³ p-valor.

### Imagem

- Preferir screenshot real da UI (aba Analisar com status Vencedor).
- Se o asset ainda nÃƒÂ£o existir no repo do portfÃƒÂ³lio, use o mesmo fallback/placeholder que os outros projetos usam atÃƒÂ© a imagem ser adicionada em `/projects/statlab-experiments/` (ou caminho equivalente do repo).

### CritÃƒÂ©rio de pronto

- [ ] Card visÃƒÂ­vel na seÃƒÂ§ÃƒÂ£o de projetos, no mesmo estilo dos demais.
- [ ] Links Demo e GitHub funcionando.
- [ ] Nenhuma regressÃƒÂ£o visual no restante do portfÃƒÂ³lio.
- [ ] Build/lint do portfÃƒÂ³lio passando.

### ReferÃƒÂªncia tÃƒÂ©cnica (contexto, nÃƒÂ£o precisa expor no card)

- Backend: https://statlab-experiments-api.vercel.app  
- Handoff completo: arquivo `portfolio-project-handoff.md` no repositÃƒÂ³rio StatLab-Experiments.
