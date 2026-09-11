# Research Note: LLD Learner Problem & Platform Direction

## 1. Executive Summary

Low-Level Design (LLD) and Object-Oriented Domain Design are critical skills for software engineers preparing for technical interviews and building maintainable enterprise software. However, existing preparation platforms fail to provide effective learning loops for LLD:

1. **Coding platforms (LeetCode, HackerRank)** test algorithmic correctness via unit tests (`input -> output`), which fails to evaluate class responsibilities, coupling, or extensibility.
2. **Diagramming tools (Excalidraw, Lucidchart, Mermaid editors)** allow drawing class diagrams but provide zero automated evaluation or feedback.
3. **Reference-solution blogs and videos** present a single canonical class diagram for a problem (e.g., "The Parking Lot Solution"), misleading learners into thinking design has a single correct answer.

The **LLD Practice Platform** bridges this gap by introducing text-based design submissions evaluated against an **explainable design rubric** that recognizes multiple valid approaches.

---

## 2. Competitive Landscape & Identified Gaps

| Platform Type | Primary Interface | Evaluation Mechanism | Key Gap in LLD Practice |
|---|---|---|---|
| **LeetCode / HackerRank** | Code Editor | Unit tests & time complexity | Cannot evaluate object-oriented responsibilities, abstractions, or design trade-offs. |
| **Excalidraw / Diagram Tools** | Canvas / Drag & Drop | None (Manual drawing) | No automated feedback or guidance on design weaknesses. |
| **Interview Prep Courses** | Text / Video | Static reference solutions | Promotes memorization over design reasoning; penalizes valid alternative designs. |
| **LLD Practice Platform (Target)** | Structured Form | Deterministic + LLM reasoning | Provides structured, explainable feedback on trade-offs without enforcing one canonical answer. |

---

## 3. Product Direction & Design Choices

### Rationale A: Why Text-Based Submission for MVP?

Graphical UML diagram editors introduce high interaction friction (drag-and-drop alignment, arrow connection bugs, screen layout limits) without adding structural semantic value for evaluation. 

By structuring text submissions into four explicit dimensions:
- **Assumptions**
- **Classes & Interfaces**
- **Responsibilities & Relationships**
- **Design Explanation & Rationale**

The platform forces the learner to articulate *why* they chose specific patterns, while giving the evaluation engine clear evidence to evaluate single responsibility, coupling, and extensibility.

### Rationale B: Evidence-Based Feedback Over Canonical Answer Matching

In software engineering, two completely different designs for a Parking Lot can both be excellent:
- **Approach 1**: `ParkingLot` ➔ `ParkingFloor` ➔ `ParkingSpot` ➔ `PricingStrategy` (Interface)
- **Approach 2**: `ParkingFacility` ➔ `SpotManager` ➔ `VehicleRegistry` ➔ `FeeCalculator`

If an automated system penalizes Approach 2 simply because class names do not match a reference diagram, the learner receives negative reinforcement for valid engineering decisions.

Our evaluation engine uses **evidence-based assessment**:
- It extracts observations directly from the learner's text.
- It highlights potential concerns (e.g., "ParkingLot is handling both space allocation and payment processing").
- It suggests actionable improvements without declaring the design invalid.
- It presents active-learning follow-up design questions to prompt the user for their next iteration.
