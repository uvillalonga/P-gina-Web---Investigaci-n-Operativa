---
name: inventory-theory-engine
description: >-
  Mathematical models, calculation algorithms, edge cases, and exam-solving techniques for Inventory Theory
  (Investigación Operativa - UTN). Use when implementing or debugging inventory calculations, EOQ,
  ROP, multi-item Lagrange constraints, price breaks, and sensitivity analysis.
---

# Inventory Theory & Optimization Engine (Investigación Operativa)

This skill documents the exact mathematical formulation, nomenclature, and calculation logic used for Unit 5 (Inventarios).

## 1. Classical Deterministic Model (EOQ / Wilson)

- **Optimal Lot Size:**
  $$q_0 = \sqrt{\frac{2 \cdot k \cdot D}{T \cdot c_1}}$$
- **Number of Orders:** $n = \frac{D}{q_0}$
- **Time between Orders (Cycle):** $t_0 = \frac{T}{n} = \frac{q_0}{D} \cdot T$
- **Expected Total Cost:**
  $$CTE(q) = (b \cdot D) + \left(\frac{D}{q} \cdot k\right) + \left(\frac{q}{2} \cdot c_1 \cdot T\right)$$
- **Fundamental Equilibrium Property:**
  $$C_{preparación}(q_0) = C_{almacenamiento}(q_0)$$

## 2. Lead Time & Reorder Point (ROP)

- **Daily Consumption Rate:** $d = \frac{D}{T}$
- **Theoretical ROP (Bruto):** $ROP_{bruto} = d \cdot L$
- **Effective Physical ROP in Warehouse (when $L > t_0$):**
  When lead time $L$ exceeds batch cycle duration $t_0 = q / d$, there are $m$ orders in transit:
  $$m = \lfloor \frac{ROP_{bruto}}{q} \rfloor$$
  $$ROP_{efectivo} = ROP_{bruto} - (m \cdot q) = (d \cdot L) \pmod q$$

## 3. Multi-Item Space/Volume Constraint (Lagrange Multipliers)

- **Constraint:** $\sum_{i=1}^M s_i q_i \le S_{max}$
- **Step 1:** Calculate unconstrained $q_{0,i}$. If $\sum s_i q_{0,i} \le S_{max}$, unconstrained solution is optimal ($\lambda = 0$).
- **Step 2:** If $\sum s_i q_{0,i} > S_{max}$, solve for Lagrange multiplier $\lambda > 0$:
  $$q_i^*(\lambda) = \sqrt{\frac{2 \cdot k_i \cdot D_i}{T \cdot (c_{1,i} + 2 \lambda s_i)}}$$
  Find $\lambda$ numerically such that $\sum s_i q_i^*(\lambda) = S_{max}$.

## 4. Quantity Discounts / Price Breaks

- For each tier $j$ with price $b_j$, calculate candidate $q_{0,j} = \sqrt{\frac{2 k D}{T c_{1,j}}}$.
- If $q_{0,j} < q_{min,j}$, adjust candidate to lower bound $q_{c,j} = q_{min,j}$.
- If $q_{0,j} \in [q_{min,j}, q_{max,j}]$, then $q_{c,j} = q_{0,j}$.
- If $q_{0,j} > q_{max,j}$, tier is infeasible.
- Evaluate $CTE(q_{c,j})$ for all feasible candidates and pick the minimum.
