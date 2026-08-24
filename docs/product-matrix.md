# BuildMatch — 20-Product Dataset Matrix

- **Status:** Implemented and verified
- **Initially locked:** 21 August 2026
- **Purpose:** Record the implemented product coverage and technical shape.

All names, SKUs, purposes, and values below are fictional demonstration content. The planned specification types and units are informed by public industry catalogues, but must not be used for construction decisions.

## Coverage at a glance

| Category | Products | Acoustic | Fire | Moisture | No performance need |
| --- | ---: | ---: | ---: | ---: | ---: |
| Boards | 5 | 1 | 2 | 2 | 1 |
| Insulation | 5 | 2 | 2 | 1 | 1 |
| Profiles | 5 | 1 | 0 | 1 | 3 |
| Accessories | 5 | 1 | 1 | 2 | 1 |
| **Total product assignments** | **20** | **5** | **5** | **6** | **6** |

The performance columns count products carrying each tag, so multi-performance products appear in more than one column.

## Product matrix

| # | Product | Proposed SKU | Category | Performance needs | Main purpose | Planned key specs |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | CoreBoard Standard | BLD-CB-1209 | Boards | — | Everyday lining board for internal partitions and ceilings. | Thickness; width; length; board weight |
| 2 | QuietBoard 15 | BLD-QB-1512 | Boards | Acoustic | Higher-mass board for sound-sensitive internal partitions. | Thickness; density; board weight; width |
| 3 | FlameBoard Type F | BLD-FB-1512 | Boards | Fire | Fire-resistant lining for protected wall and ceiling assemblies. | Thickness; reaction to fire; board weight; length |
| 4 | AquaBoard MR | BLD-AB-1212 | Boards | Moisture | Moisture-resistant lining for humid interior areas. | Thickness; water absorption; width; length |
| 5 | ShieldBoard FM | BLD-SB-1512 | Boards | Fire, Moisture | Dual-performance board for humid areas requiring fire resistance. | Thickness; reaction to fire; water absorption; board weight |
| 6 | SoundWool Flex | BLD-SW-5075 | Insulation | Acoustic | Semi-rigid mineral-wool batts for acoustic partition cavities. | Thickness; density; airflow resistivity; pack coverage |
| 7 | FireWool Slab | BLD-FW-6080 | Insulation | Fire | Non-combustible insulation for protected voids and enclosures. | Thickness; density; reaction to fire; thermal conductivity |
| 8 | ThermoWool Cavity | BLD-TW-9010 | Insulation | — | Thermal insulation for internal cavity applications. | Thickness; thermal conductivity; pack coverage; width |
| 9 | HydroWool Cavity | BLD-HW-8010 | Insulation | Moisture | Water-repellent mineral-wool insulation for moisture-sensitive interior cavity applications. | Thickness; water absorption; thermal conductivity; reaction to fire |
| 10 | SecureWool AF | BLD-SW-1006 | Insulation | Acoustic, Fire | Dense insulation for partitions requiring acoustic and fire performance. | Thickness; density; reaction to fire; airflow resistivity |
| 11 | StudProfile CW 75 | BLD-CW-7506 | Profiles | — | Vertical metal stud for non-load-bearing partition framing. | Web width; flange width; material thickness; length |
| 12 | TrackProfile UW 75 | BLD-UW-7504 | Profiles | — | Horizontal track for compatible partition studs. | Web width; flange width; material thickness; length |
| 13 | AcousticTrack 75 | BLD-AT-7504 | Profiles | Acoustic | Resilient-lined track that helps limit sound transfer at partition perimeters. | Web width; lining material; material thickness; length |
| 14 | ReinforcedProfile UA 50 | BLD-UA-5004 | Profiles | — | Reinforced metal profile for door openings and high-load areas in internal partitions. | Web width; material thickness; steel grade; length |
| 15 | CorroTrack UW 50 | BLD-CT-5004 | Profiles | Moisture | Coated track profile for humid internal zones. | Web width; coating; material thickness; length |
| 16 | JointTape Paper | BLD-JT-5000 | Accessories | — | Paper tape for reinforcing gypsum-board joints before finishing. | Roll length; roll width; material; pack quantity |
| 17 | Sealant FireStop | BLD-FS-310 | Accessories | Fire | Intumescent sealant for sealing linear joints in fire-resistant linings. | Cartridge size; application temperature; joint width range; cure rate |
| 18 | Sealant AquaSeal | BLD-AS-310 | Accessories | Moisture | Flexible sealant for moisture-resistant perimeter and service joints. | Cartridge size; movement capability; application temperature; skin time |
| 19 | ResilientStrip 50 | BLD-RS-5000 | Accessories | Acoustic | Compressible strip that helps decouple partition edges from surrounding structure. | Roll length; width; thickness; material |
| 20 | HydroJoint Compound 60 | BLD-HJ-200 | Accessories | Moisture | Setting joint compound for finishing moisture-resistant boards in intermittently humid interior areas. | Bag weight; setting time; coverage; application thickness |

## Dataset checks

- Each category has five products, so every category filter returns a substantial set.
- Each performance need is represented by multiple products across multiple categories.
- Multi-performance products exist in Boards and Insulation: ShieldBoard FM and SecureWool AF.
- Untagged products exist in every category: CoreBoard Standard, ThermoWool Cavity, StudProfile CW 75, TrackProfile UW 75, ReinforcedProfile UA 50, and JointTape Paper.
- Some category/performance combinations intentionally return zero results, including `category=profiles&need=fire`, so contextual counts and broaden-search recovery actions can be exercised.
- Specification labels intentionally vary by product family; the flexible `Specification[]` contract is therefore required.
- Names, SKUs, category terms, need keywords, features, and descriptions provide useful coverage for relevance ranking, guarded typo recovery, autocomplete, match explanations, no-result queries, and search-intent suggestions.

## Data authoring guardrails

When this becomes `data/products.ts`:

- use exactly the 20 products in this matrix;
- preserve each product's category and performance-need assignments;
- write concise, original descriptions and features rather than copying manufacturer copy;
- give every product at least four specifications from the planned key-spec types;
- keep values plausible but explicitly fictional; and
- use `[]` for products with no performance need; do not add a generic performance value.

Performance-need tags represent discovery relevance within the fictional catalogue and must not be interpreted as standalone certified system-performance claims.
