---
name: plc-simplex-engine
description: >-
  Mathematical formulation, exact terminology, and step-by-step algorithm (Simplex tableau, Gran M,
  graphical method, duality, sensitivity analysis) for Unit 6 (Programación Lineal Continua) of the
  UTN Operations Research course. Use when implementing or debugging the PLC solver/simulator.
---

# Programación Lineal Continua — Motor de Cálculo (Unidad 6)

Notación y algoritmo exactos usados por la cátedra (UTN IO). Usar SIEMPRE esta terminología en la UI.

## 1. Vocabulario exacto de la cátedra

- **Funcional** = función objetivo `z`. **Variables de decisión** = `x_j` ("variables duras").
- **Coeficientes del funcional** = `c_j`. **Coeficientes tecnológicos** = `a_ij`. **Términos independientes** = `b_i`.
- **λ (lambda)** = variable de holgura/sobrante, para restricciones `≤` (coeficiente +1).
- **μ (mu)** = variable artificial/excedente (Gran M), para restricciones `≥` (λ con coef. -1 + μ con coef. +1) o `=` (solo μ).
- **TIP** = Tabla Inicial del Primal. **TOP** = Tabla Óptima del Primal.
- **Variable básica**: en la base (columna `Xk`), valor libre. **No básica**: fuera de la base, vale 0.
- **Costo de Oportunidad**: `zj-cj` de una variable no básica **dura** (de decisión).
- **Valor Marginal**: `zj-cj` de una variable no básica **débil** (slack λ) — óptica primal ("comprar recursos").
- **Precio Sombra**: mismo valor, óptica dual ("vender recursos").
- **Θ (Theta)**: razón `b_i / a_ij`, criterio de salida.
- **Base Degradada**: variable básica con valor 0 (degeneración). **Cero alternativo (0\*)**: `zj-cj=0` en no básica (soluciones múltiples).
- **Lucro Cesante** = `Σ (valor_marginal_i × requerimiento_i)` de un producto nuevo potencial.

## 2. Forma estándar

$$z=\sum_j c_j x_j \to \max,\quad \sum_j a_{ij}x_j + \lambda_i = b_i\ \ (\forall i),\quad x_j,\lambda_i\ge0$$

## 3. Método gráfico (2 variables)

1. Graficar cada restricción como recta (cortes con ejes: `x1=0→x2=b_i/a_i2`, `x2=0→x1=b_i/a_i1`).
2. Región factible = intersección de semiplanos + `x_j≥0`.
3. Recta del funcional `z=c1x1+c2x2` por el origen; desplazarla paralelamente: alejándose del origen = maximizar, acercándose = minimizar.
4. Óptimo en el vértice donde la recta z sale de la región factible por última vez. Resolver el sistema 2x2 de las rectas que definen ese vértice.
5. Slack en el óptimo: `λ_i = b_i - Σ a_ij x_j*`.

## 4. Método Simplex — algoritmo exacto

**Tabla**: columnas `Ck | Xk | Bk | x1..xn | λ1..λm | (μ1..μp) | Θ`. Fila superior `Ck` = coeficientes del funcional. Fila inferior `Z=Σ Ck·Bk`. Fila `zj-cj = Σ_i c_{ki} a_ij - c_j`.

**TIP**: base inicial = todas las λ (Ck=0, Bk=b_i) si todo es `≤`; si hay `≥`/`=`, base inicial = las μ (método Gran M). `zj-cj` inicial = `-c_j` para variables de decisión.

**Paso 1 — Pivote**:
- Columna pivote (entra): en MAX, la columna con `zj-cj` más negativo; en MIN, la más positiva.
- Fila pivote (sale): `Θ_i = b_i/a_ij` solo con `a_ij>0`; elegir la fila con **menor Θ positivo**.

**Paso 2 — Iteración (Gauss-Jordan)**:
- Fila pivote nueva: `a'_ij = a_ij / pivote`.
- Resto de filas (regla del rectángulo): `a'_ij = a_ij - (b·c)/d`, donde `d`=pivote, `c`=elemento en la fila del pivote y columna del elemento a actualizar, `b`=elemento en la columna del pivote y fila del elemento a actualizar.
- Actualizar `Ck`/`Xk` de la fila con la variable que entró.

**Paso 3**: `Z = Σ Ck·Bk`. **Paso 4**: recalcular `zj-cj`.

**Criterio de parada**: MAX → todos los `zj-cj ≥ 0`. MIN → todos los `zj-cj ≤ 0`. Si no, volver al Paso 1.

**Lectura de la TOP**: básicas = columna `Bk`; no básicas = 0; `Z` = óptimo; `zj-cj` de las λ = valores marginales.

## 5. Método de la Gran M

Restricciones `≥`: `Σ a_ij x_j - λ_i + μ_i = b_i`. Restricciones `=`: `Σ a_ij x_j + μ_i = b_i`.
Penalización en el funcional: MIN → `+M·μ`; MAX → `-M·μ`. Base inicial TIP = las μ.
`zj-cj` se expresa como polinomio en `M` (ej. `-0,5+2500M`); M domina el signo para decidir la columna pivote.
Una variable artificial que sale de la base **no vuelve a entrar** (bloquear esa columna, `a_ij=0` en adelante para el criterio de pivote).

## 6. Casos especiales — detección exacta en el tableau

| Caso | Detección en el tableau |
|---|---|
| Solución única | TOP con todos los `zj-cj` de signo estrictamente correcto |
| Múltiples óptimos (alternativas) | TOP con `zj-cj=0` en una columna **no básica** (cero alternativo) |
| Degenerada | Empate en el Θ mínimo entre 2+ filas → una básica queda con `Bk=0` |
| No acotada (poliedro abierto) | En la columna pivote candidata, **ningún** `a_ij>0` (no hay Θ calculable) |
| Infactible | Al finalizar Gran M, queda(n) μ **en la base con valor > 0** |

Relación primal-dual de casos particulares: Alternativas↔Degenerada, Poliedro Abierto↔Incompatible (son duales entre sí).

## 7. Dualidad

Simétrica: Primal MAX `Σc_jx_j, Σa_ijx_j≤b_i` ↔ Dual MIN `Σb_iy_i, Σa_ij^T y_i≥c_j`.
Construcción: transponer `A→A^T`; `B_primal→C_dual`; `C_primal→B_dual`; cada restricción primal `i` ↔ variable dual `y_i`; cada variable primal `x_j` ↔ restricción dual `j`. Las variables duras de un modelo son las slack del otro.
**Teorema fundamental**: si el primal tiene óptimo finito, el dual también, y **Z coincide** en el óptimo.
Interpretación: primal→valor marginal ("comprar recursos"); dual→precio sombra ("vender recursos") — mismo número, otra óptica.

## 8. Análisis de sensibilidad

$$c_j' = c_j \pm \frac{z_j-c_j}{a_{ij}}$$

Signo: en MAX, `-` da el límite superior y `+` el inferior; en MIN es al revés. Se recorre la fila de `x_k` en la TOP y se toma el primer candidato que fuerza un cero alternativo — ese es el límite; para el otro límite se repite con el signo opuesto. Al llegar a un límite, forzar el cero alternativo e iterar una vez más para hallar el rango siguiente (cambio de vértice).

Lucro cesante para evaluar un producto nuevo: si `Σ(valor_marginal_i × requerimiento_i) ≤ margen_del_producto` → conviene incorporarlo.

## 9. Casos de prueba (para validar el solver)

**A — Maximización 2 var/3 restr. (caso ancla usado en toda la teoría, piezas A y B)**
`z=400x1+300x2 max`; `9x1+18x2≤720`; `16x1+8x2≤640`; `10x1+10x2≤480`.
Óptimo: `x1=32, x2=16, λ1=144, λ2=0, λ3=0, Z=17600`. Valores marginales: `λ2→12,5`, `λ3→20`.
Sensibilidad de `c1`: rango óptimo `[300, 600]` manteniendo el mix; en 600→`(x1=40,x2=0,Z=24000)`; en 300→`(x1=16,x2=32,Z=14400)`.

**B — Minimización con Gran M (dietético)**
`z=0,5x1+0,9x2 min`; `2000x1+5000x2≥3000`; `400x1+200x2≥250`; `100x1+100x2≥90`.
Óptimo: `x1=0,5, x2=0,4, λ1=0, λ2=30, λ3=0, Z=0,61`.

**C — Dualidad (bloques y muñecas)**
Primal MAX `z=500x1+200x2`; `x2≤3`; `4x1+6x2≤24`; `(1/3)x1-0,25x2≤1` (el apunte redondea a 0,33; usar la fracción exacta 1/3 o el resultado da Z≈2276,5 en vez del valor de cátedra).
`x1=4, x2=1,3333, Z=2266,67`. Verificado con motor numérico: el dual debe dar el mismo Z (validado en el sitio: w*=17600 coincide con Z*=17600 usando el Caso A).

**D — Casos particulares**
Alternativas: `z=8x1+4x2 max, 4x1+2x2≤8, x2≤2` → óptimos en `(2,0)` y `(1,2)`, ambos `Z=16`.
Degenerada: `z=4x1+3,5x2 max, 2x1+5x2≤20, 10x1+4x2≤40, 1,5x1+x2≤6` → empate Θ=4; óptimo `Z≈18,7273`.
No acotada: `z=6x1+8x2 max, x1+x2≥2, 4x1+x2≥4` → sin óptimo finito.
Infactible: `z=3x1+5x2 max, x1+x2≤2, 3x1+4x2≥9` → sin solución factible.

**Nota**: al programar, recalcular todo con álgebra exacta (fracciones/decimales de precisión completa) en vez de copiar los decimales redondeados de los apuntes — hay alguna inconsistencia menor de redondeo en el material original.
