# Motor Lúdico: Generador de Recursos Pedagógicos Gamificados

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Descripción
Este repositorio contiene el núcleo algorítmico del **Motor Lúdico**, una herramienta diseñada para la creación autónoma de sopas de letras y crucigramas educativos. A diferencia de generadores tradicionales, este motor integra mecánicas de gamificación profunda, permitiendo la personalización por estudiante, el seguimiento de métricas de desempeño y la emisión de certificaciones de logros.

**Acceso a la plataforma:** [frexus.dev/wordsearch](https://www.frexus.dev/wordsearch)

## ✨ Características Principales
- **Algoritmo Blindado:** Prevención de errores de propiedad ("Cannot read properties") mediante validación perimetral de cuadrícula.
- [cite_start]**Inteligencia de Cruce:** Identificación automática de términos extensos para optimizar las colisiones de caracteres[cite: 100].
- [cite_start]**Métricas de Gamificación:** Captura de nombre del jugador, cronometrización neta, y penalizaciones por uso de pistas[cite: 113, 119].
- [cite_start]**Responsividad:** Cuadrículas auto-ajustables optimizadas para dispositivos móviles[cite: 99].

## ⚙️ Funcionamiento del Algoritmo
El script `algoritmo.js` implementa una estrategia de colocación aleatoria con un sistema de *fallback* por fuerza bruta. 
1. **Normalización:** Elimina diacríticos (acentos) para garantizar compatibilidad técnica.
2. **Ubicación:** Evalúa cuatro direcciones cardinales/diagonales `(0,1), (1,0), (1,1), (-1,1)`.
3. [cite_start]**Validación:** Verifica la "doble colisión" para permitir que las letras se compartan correctamente entre palabras cruzadas[cite: 101].

## 🚀 Uso
```javascript
// Ejemplo de inicialización
const words = ["ESTADISTICA", "INFERENCIA", "PROBABILIDAD"];
const grid = generateBoardDataPure(words, 15);
