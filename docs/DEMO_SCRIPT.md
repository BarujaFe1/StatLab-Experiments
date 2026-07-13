# Demo script (3–5 minutos)

**URL:** https://statlab-ab.vercel.app  
**Objetivo:** mostrar decisão responsável em A/B testing (não “dashboard bonito”).

## Roteiro

1. **Abertura (30s)**  
   “StatLab é um laboratório frequentista para planejar e interpretar testes A/B. Não é plataforma de experimentação em produção; é um case de estatística aplicada + engenharia.”

2. **Planejar (60–90s)**  
   - Aba Planejar → baseline `0.05`, MDE `0.01`, poder `0.80` → Calcular.  
   - Explicar: MDE = menor efeito absoluto desejado; poder = chance de detectar se existir; n ≈ 8143/grupo.

3. **Cenário Vencedor (60s)**  
   - Chip “Vencedor” → status verde, significativo + relevante (MPE).  
   - Mostrar badges e próximos passos (validar instrumentação / custo de rollout).

4. **Cenário Efeito Fraco (45s)**  
   - Mesmo uplift, MPE alto → “sinal sem relevância prática”.  
   - Punchline: p-valor baixo ≠ rollout automático.

5. **Cenário Inconclusivo (45s)**  
   - Amostra pequena → não declarar vencedor; voltar ao Planejar.

6. **Fechamento (30s)**  
   - Arquitetura: Next.js + Flask WSGI em dois projetos Vercel (rewrite `/api`).  
   - Testes pytest + CI.  
   - Limitações: sem auth/DB/sequential testing.

## Captura de screenshots

Salvar em `docs/screenshots/`:

1. `01-plan-sample-size.png` — resultado do cálculo de n  
2. `02-analyze-vencedor.png` — card Vencedor + gráfico  
3. `03-analyze-efeito-fraco.png` — contraste didático  
4. `04-scenarios-chips.png` — chips de cenários  

Sem PII. Preferir desktop 1280×800 e um crop mobile opcional.
