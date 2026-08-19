---
name: decision-theory-engine
description: >-
  Exact terminology, formulas, and worked example for Unit 7 (Teoría de Juegos y Decisiones) of the
  UTN Operations Research course: decision criteria under uncertainty (Wald, Optimista, Hurwicz,
  Savage), expected value, decision trees, and the conceptual game-theory content actually covered
  by the catedra (Nash equilibrium, cooperative/non-cooperative games, Prisoner's Dilemma).
  Use when implementing or debugging the Juegos & Decisiones solver.
---

# Teoría de Juegos y Decisiones — Motor de Cálculo (Unidad 7)

**Importante**: la cátedra NO cubre la teoría clásica de juegos de suma cero con matriz de pagos
(maximin/minimax de estrategias puras, punto de silla, dominancia, estrategias mixtas 2x2, método
gráfico). Solo cubre Teoría de Juegos a nivel conceptual (ver §1) y Teoría de Decisiones con fórmulas
completas (ver §2). No implementar un "resolvedor de matriz de juegos" clásico salvo pedido explícito.

## 1. Teoría de Juegos (contenido conceptual, sin algoritmo de resolución)

- Origen: Von Neumann & Morgenstern (1944). Planteamiento **estratégico/no cooperativo** vs
  **coalicional/cooperativo**. A.W. Tucker creó el Dilema del Prisionero. John Nash (Nobel 1994):
  Equilibrio de Nash.
- **Matriz de pagos**: relaciona estrategias de cada jugador con las recompensas de cada combinación.
  Ejemplo Piedra/Papel/Tijera: convención de signos de la cátedra: positivo = gana jugador **fila**,
  negativo = gana jugador **columna**.
- **Clasificación de juegos**: bipersonales/N-personales · finitos/infinitos · estáticos/dinámicos ·
  cooperativos/no cooperativos · suma constante (caso particular: suma cero)/suma no constante ·
  información completa/incompleta · información perfecta/imperfecta.
- **Juegos cooperativos**: jugadores forman **coaliciones** vía contratos; compiten entre coaliciones.
- **Equilibrio de Nash**: acuerdo que ninguna parte puede romper unilateralmente sin perder — no
  necesariamente el mejor resultado conjunto (ver Dilema del Prisionero).
- **Dilema del Prisionero** (caso de referencia, matriz en años de condena):

  | | A: Coopera | A: No Coopera |
  |---|---|---|
  | **B: Coopera** | (-2,-2) | (-10,0) |
  | **B: No Coopera** | (0,-10) | (-6,-6) |

  Equilibrio no cooperativo: **(No Coopera, No Coopera) = (-6,-6)**, peor para ambos que (Coopera,Coopera).

## 2. Teoría de Decisiones

**Diferencia con Teoría de Juegos** (frase textual de cátedra): la interacción posible entre los
jugadores — en Decisiones el "rival" es la naturaleza (estados), no otro jugador estratégico.

**Contextos**: Certidumbre (se sabe el estado) · Riesgo (se conocen probabilidades de los estados) ·
Incertidumbre (no se conocen probabilidades).

**Notación**: `E={E1..Em}` estados de la naturaleza (columnas) · `A={A1..An}` alternativas (filas) ·
`x_ij` resultado de tomar `A_i` si ocurre `E_j`. Tabla de decisión = matriz `x_ij`.

### 2.1 Bajo riesgo (con probabilidades `p_j`)

$$VME(A_i)=\sum_{j=1}^m p_j\cdot x_{ij}$$

Elegir el `A_i` con mejor VME (máx si ganancias, mín si costos).

### 2.2 Bajo incertidumbre (sin probabilidades) — 4 criterios exactos

**a) Wald (pesimista, maximin/minimax)**:
$$\text{ganancias: } \max_i(\min_j x_{ij}) \qquad \text{costos: } \min_i(\max_j x_{ij})$$

**b) Optimista (Maxi-Max)**:
$$\max_i(\max_j x_{ij})$$

**c) Hurwicz** (α = índice de optimismo ∈[0,1], por defecto 0,5 si no se especifica):
$$S_i(\alpha)=\alpha\cdot\max_j x_{ij} + (1-\alpha)\cdot\min_j x_{ij}$$
α=1 → equivale a Optimista. α=0 → equivale a Wald. Elegir mejor `S_i`.

**d) Savage (arrepentimiento / costo de oportunidad, minimax regret)**:
$$r_{ij}=\max_k x_{kj} - x_{ij}\ \ (\text{si ganancias; si costos: } r_{ij}=x_{ij}-\min_k x_{kj})$$
$$\text{Savage}=\min_i(\max_j r_{ij})$$

Nota: la cátedra NO nombra explícitamente un criterio "Laplace" (igual probabilidad); el más cercano
es el VME con `p_j` iguales dado en el enunciado — no agregarlo como criterio separado con ese nombre
salvo que el usuario lo pida.

### 2.3 Árbol de decisión (roll-back)

- **Vértice de azar** (○): la naturaleza elige, tantos arcos como estados.
- **Vértice de decisión** (□): se elige, tantos arcos como alternativas.
- **Vértice terminal/hoja** (△): resultado final del camino.
- Resolución de hojas a raíz: nodos de azar → valor esperado ponderado por probabilidad; nodos de
  decisión → máximo (o mínimo si costos) entre alternativas, descartando ramas no elegidas.

## 3. Caso de prueba completo — Vendedor de periódicos (tabla 5x5, bajo riesgo/incertidumbre)

Costo compra $20/diario, precio venta $25/diario (ganancia $5/vendido), no vendidos se pierden.
Demanda ∈{6,7,8,9,10}, cada una con `p=0,2`. Alternativas de pedido ∈{6,7,8,9,10}.

Tabla de pagos (filas=Pedido, columnas=Demanda 6/7/8/9/10):

| Pedido\Demanda | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|
| 6 | 30 | 30 | 30 | 30 | 30 |
| 7 | 10 | 35 | 35 | 35 | 35 |
| 8 | -10 | 15 | 40 | 40 | 40 |
| 9 | -30 | -5 | 20 | 45 | 45 |
| 10 | -50 | -25 | 0 | 50 | 50 |

Resultados esperados (para validar el solver):
- **VME** (p=0,2 c/u): Pedido6=30, Pedido7=30, Pedido8=25, Pedido9=15, Pedido10=0 → **óptimo: 6 o 7 (empatan en 30)**.
- **Wald**: mínimos por fila = 30,10,-10,-30,-50 → máximo de esos = 30 → **óptimo: Pedido 6**.
- **Optimista**: máximos por fila = 30,35,40,45,50 → máximo = 50 → **óptimo: Pedido 10**.
- **Hurwicz α=0,5**: S = 30, 22.5, 15, 7.5, 0 → **óptimo: Pedido 6**.
- **Savage**: máximos por columna = 30,35,40,45,50. Matriz de arrepentimiento, máximo por fila:
  Pedido6→20, Pedido7→20, Pedido8→40, Pedido9→60, Pedido10→80 → mínimo = 20 → **óptimo: 6 o 7 (empatan)**.

Usar esta tabla como caso demo por defecto en la calculadora de criterios.
