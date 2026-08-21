# Demo script (3–5 minutos)

**URL:** https://statlab-ab.vercel.app  
**Objetivo:** mostrar decisão responsável em A/B testing (não “dashboard bonito”).

## Roteiro

1. **Abertura (30s)**  
   “StatLab é um laboratório frequentista para planejar e interpretar testes A/B. Não é plataforma de experimentação em produção; é um case de estatística aplicada + engenharia.”

2. **Planejar (60–90s)**  
   - Aba Planejar → baseline `0.05`, MDE `0.01`, poder `0.80`, alpha `0.05` → Calcular.  
   - Explicar: MDE = menor efeito absoluto desejado (0.01 = 1 pp); poder = chance de detectar se existir; n ≈ 8143/grupo.

3. **Cenário Melhora (60s)**  
   - Chip “Melhora” → status verde, significativo após Bonferroni + relevante (MPE).  
   - Mostrar alpha ajustado, IC no nível real (98,33% com 3 comparações) e próximos passos.

4. **Cenário Regressão (60s)** — o diferencial do lab  
   - Chip “Regressão” → A 60% vs B 58%, p ≈ 0.004, diff = −2 pp.  
   - Punchline: “p-valor baixo não é vitória — aqui o sinal diz que B **prejudica**. O motor antigo chamava isso de Vencedor; agora é impossível.”

5. **Cenário Efeito Fraco (45s)**  
   - Mesmo uplift, MPE alto → “sinal sem relevância prática”.  
   - Punchline: p-valor baixo ≠ rollout automático.

6. **Cenário Inconclusivo + caso-limite (45s)**  
   - Amostra pequena → não declarar vencedor; voltar ao Planejar.  
   - Zero conversões → p-valor “indefinido” honesto (sem número fabricado) + IC.

7. **Fechamento (30s)**  
   - Arquitetura: Next.js + Flask WSGI em dois projetos Vercel (rewrite `/api`).  
   - 47 testes pytest (golden states G1–G13) + CI.  
   - Limitações: sem auth/DB/sequential testing — premissas visíveis na UI.

## Captura de screenshots

Salvar em `docs/screenshots/`:

1. `01-plan-sample-size.png` — resultado do cálculo de n  
2. `02-analyze-melhora.png` — card Melhora + IC com nível real  
3. `03-analyze-regressao.png` — card Regressão (guard do P0)  
4. `04-analyze-efeito-fraco.png` — contraste didático  
5. `05-scenarios-chips.png` — chips dos 5 cenários  

Sem PII. Preferir desktop 1280×800 e um crop mobile opcional.
