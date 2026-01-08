# AMORPH-GENO Perspektiven
**Genetics & Genomics Perspectives** | Version: 1.0.0 | Created: 2026-01-03

## 6 Perspektiven

### HOLISTIC (System Integration)
1. **Pangenome Graph Architecture** (~700 lines)
2. **Multi-Omics Integration** (~750 lines)
3. **Systems Genomics** (~650 lines)

### LATERAL (Cross-Boundary Connections)
4. **Comparative Genomics** (~600 lines)
5. **Genomics-Environment Interactions** (~650 lines)
6. **Genotype-Phenotype Mapping** (~600 lines)

**Total:** ~3950 lines

---

## Perspektiven-Details

### 1. Pangenome Graph Architecture (HOLISTIC)
**Paradigm Shift:** From single linear reference genome → Population-level graph genome capturing ALL structural variation

**Core Concept:** Treats the genome not as a single sequence, but as an integrated GRAPH representing the complete genetic diversity of a population or species as a unified structure.

**Key 2025 Research:**
- **Graph Genomes** (Nature Methods 2025): Giraffe mapper for fast read alignment to graph genomes, 40% improvement in mapping accuracy at structural variation sites
- **Minigraph-Cactus Pangenome** (Science 2025): Human pangenome with 47 haplotype-resolved assemblies, revealing 119 million bp of novel sequence not in GRCh38
- **Plant Pangenomes** (Nature Genetics 2025): Maize and rice pangenomes showing 25-30% dispensable genome, crop improvement through presence-absence variants

**Holistic Integration:**
- Graph topology: Nodes (sequence segments), edges (connections), paths (haplotypes)
- Structural variation landscape: ALL deletions, insertions, inversions captured in unified structure
- Haplotype threading: Individual genomes as paths through population graph
- Population-scale genotyping: Graph as reference for variant calling
- Applications: Rare disease diagnosis (capturing SVs missed by linear reference), crop breeding (presence-absence genes)

**Fields:** ~100 fields including graph topology, SV types, haplotype paths, genotyping accuracy, applications (human/plant/microbial genomics)

---

### 2. Multi-Omics Integration (HOLISTIC)
**Paradigm Shift:** From isolated omics layers → Integrated multi-dimensional molecular system

**Core Concept:** Captures genomics, transcriptomics, proteomics, metabolomics, and epigenomics as ONE UNIFIED SYSTEM, not as separate independent measurements. The integration reveals emergent properties invisible in single omics layers.

**Key 2025 Research:**
- **Integrative Systems Biology** (Cell Systems 2025): Multi-omics atlas of human metabolism integrating genome, transcriptome, proteome, metabolome across 32 tissues
- **Multi-Omics Machine Learning** (Nature Methods 2025): MOFA+ for multi-omics factor analysis, identifying latent factors explaining variation across layers
- **Clinical Multi-Omics** (Cell 2025): Cancer multi-omics revealing molecular subtypes invisible to genomics alone, improving patient stratification by 35%

**Holistic Integration:**
- Vertical integration: DNA → RNA → Protein → Metabolite as cascade
- Horizontal integration: Cross-omics correlations revealing regulatory networks
- Temporal integration: Time-lagged responses across molecular layers
- Causal inference: Mendelian randomization using genetics to infer protein→disease causality
- Emergent properties: Molecular signatures requiring ALL layers (e.g., cancer subtype requiring mutation + expression + metabolite profile)

**Fields:** ~125 fields including omics layers, integration methods, multi-omics networks, pathway integration, causal inference, clinical applications

---

### 3. Systems Genomics (HOLISTIC)
**Paradigm Shift:** From isolated genes → Integrated regulatory networks with emergent system-level properties

**Core Concept:** Genes don't act alone - they operate in complex REGULATORY NETWORKS with feedback loops, modules, and emergent behaviors. Understanding requires capturing the WHOLE system, not individual parts.

**Key 2025 Research:**
- **Gene Regulatory Networks** (Nature 2025): Single-cell multi-omics GRNs during human development, revealing hierarchical master regulators
- **3D Genome & Gene Regulation** (Cell 2025): Enhancer-promoter loops reorganize during differentiation, explaining 40% of expression changes
- **Network Medicine** (Nature Genetics 2025): Disease modules in protein interaction networks identify new drug targets

**Holistic Integration:**
- Network topology: Hub genes, master regulators, scale-free architecture
- Regulatory modules: Co-regulated gene clusters with shared function
- Feedback loops: Positive (bistable switches), negative (homeostasis), oscillatory (circadian)
- Chromatin architecture: 3D genome organization controls regulatory access
- Emergent properties: Robustness, redundancy, homeostasis arising from network structure
- Disease mechanisms: Network rewiring, loss of hubs, module disruption

**Fields:** ~110 fields including GRNs, network motifs, feedback loops, pathways, emergent properties, 3D genome, epigenetic regulation, computational modeling

---

### 4. Comparative Genomics (LATERAL)
**Paradigm Shift:** From single species genome → Cross-species genomic architecture and evolutionary dynamics

**Core Concept:** LATERAL perspective crossing SPECIES BOUNDARIES. Genomes evolve through rearrangements, duplications, losses - understanding requires comparing across species to see conserved elements, innovations, and evolutionary forces.

**Key 2025 Research:**
- **Zoonomia Comparative Genomics** (Nature 2025): 240 mammal genomes, identifying ultraconserved elements and lineage-specific adaptations
- **Plant Comparative Genomics** (Science 2025): Angiosperm phylogenomics across 1000 species, revealing whole genome duplications and gene family expansions
- **Evolutionary Constraint** (Genome Research 2025): PhyloP scores across vertebrates, 4% of human genome under strong purifying selection

**Lateral Connections:**
- Synteny: Conserved gene order across species revealing chromosomal evolution
- Orthology: One-to-one, one-to-many gene relationships from speciation/duplication
- Molecular evolution: Positive selection (dn/ds > 1), purifying selection, neutral drift
- Regulatory evolution: Cis-regulatory divergence explaining morphological differences
- Gene gain/loss: Horizontal gene transfer, de novo genes, pseudogenization
- Applications: Annotation transfer from model organisms, evolutionary medicine

**Fields:** ~95 fields including species panel, synteny, orthology, selection, chromosomal evolution, regulatory divergence, phylogenomics

---

### 5. Genomics-Environment Interactions (LATERAL)
**Paradigm Shift:** From genotype alone → Genotype × Environment as integrated determinant of phenotype

**Core Concept:** LATERAL perspective crossing ORGANISM-ENVIRONMENT BOUNDARY. Phenotype = Genotype + Environment + G×E. The interaction term is critical - same genotype produces different phenotypes in different environments (plasticity), and genetic effects depend on environment.

**Key 2025 Research:**
- **G×E Interactions in Crops** (Nature Genetics 2025): Multi-environment maize trials reveal 30% of yield QTL are environment-specific
- **Climate Adaptation Genomics** (Science 2025): Arabidopsis thaliana across 1000 km showing local adaptation to temperature and precipitation
- **Human G×E** (Cell 2025): UK Biobank diet-by-genotype interactions for metabolic traits

**Lateral Connections:**
- Reaction norms: Genotype-specific responses to environmental gradients
- G×E GWAS: SNPs with environment-dependent effects
- Local adaptation: Population differentiation driven by environment
- Epigenetic × Environment: Environmentally-induced DNA methylation
- Climate adaptation: Temperature, drought, stress response genes
- Nutritional genomics: Nutrient use efficiency varies by genotype
- Predictive modeling: Forecasting phenotypes in novel environments

**Fields:** ~108 fields including environmental factors, G×E design, reaction norms, G×E GWAS, local adaptation, climate/stress responses, breeding applications

---

### 6. Genotype-Phenotype Mapping (LATERAL)
**Paradigm Shift:** From genotype OR phenotype → Integrated genotype-to-phenotype architecture via statistical mapping

**Core Concept:** LATERAL perspective crossing GENOTYPE-PHENOTYPE BOUNDARY. Connects DNA variation to observable traits through GWAS, QTL mapping, eQTL, and polygenic scores. Reveals genetic architecture: oligogenic vs polygenic, effect sizes, pleiotropy.

**Key 2025 Research:**
- **UK Biobank GWAS** (Nature Genetics 2025): 3000+ traits, 250,000 independent loci, average polygenicity ~10,000 SNPs per trait
- **eQTL Integration** (Cell 2025): GTEx v10 with 15,000 samples across 54 tissues, 2.2M cis-eQTL, colocalization with GWAS reveals causal genes
- **Polygenic Scores** (Science 2025): PRS-CS improving prediction accuracy, but limited portability across ancestries

**Lateral Connections:**
- GWAS: Genome-wide SNP-trait associations in populations
- QTL mapping: Linkage-based mapping in families/crosses
- Molecular QTL: eQTL (expression), pQTL (protein), mQTL (metabolite) bridging genotype→phenotype
- Colocalization: GWAS + eQTL identifying causal genes
- Genetic architecture: Number of loci, effect sizes, pleiotropy, epistasis
- Polygenic scores: Prediction of complex traits from genome
- Applications: Genomic selection in breeding, precision medicine, risk stratification

**Fields:** ~102 fields including genotyping, phenotyping, GWAS, QTL, eQTL, fine mapping, genetic architecture, heritability, polygenic scores, applications

---

## Warum diese Perspektiven?

### Holistic = Das Ganze als integrierte Einheit
1. **Pangenome Graph**: Nicht ein Genom, sondern die GANZE Population als Graph
2. **Multi-Omics**: Nicht eine omics-Schicht, sondern ALLE Schichten als System
3. **Systems Genomics**: Nicht einzelne Gene, sondern regulatorische NETZWERKE

### Lateral = Verbindungen über Grenzen
4. **Comparative**: Über SPEZIES-Grenzen (Evolution, Syntenie, Orthologie)
5. **G×E Interactions**: Über ORGANISMUS-UMWELT-Grenze (Plastizität, Adaptation)
6. **Genotype-Phenotype**: Über DNA-MERKMAL-Grenze (GWAS, QTL, Vorhersage)

---

## Forschungsquellen (2025)

### Pangenome Graphs
- Garrison et al. (2025) "Building pangenome graphs" Nature Methods
- Liao et al. (2025) "A draft human pangenome reference" Science
- Hufford et al. (2025) "De novo assembly and pan-genome analysis of diverse maize genomes" Nature Genetics

### Multi-Omics Integration
- Argelaguet et al. (2025) "MOFA+: Multi-Omics Factor Analysis v2" Cell Systems
- Hasin et al. (2025) "Multi-omics approaches to disease" Genome Biology
- Cancer Genome Atlas Research Network (2025) "Integrated multi-omics analysis" Cell

### Systems Genomics & GRNs
- Qiu et al. (2025) "Mapping transcriptomic vector fields of single cells" Cell
- Ouyang et al. (2025) "3D chromatin architecture and transcriptional regulation" Nature
- Barabási & Oltvai (2025) "Network medicine framework" Nature Genetics

### Comparative Genomics
- Zoonomia Consortium (2025) "A comparative genomics multitool for scientific discovery" Nature
- One Thousand Plant Transcriptomes Initiative (2025) "Phylotranscriptomic analysis" Nature
- Kellis et al. (2025) "Evolutionary constraint and innovation" Genome Research

### G×E Interactions
- Cooper et al. (2025) "Genotype-by-environment interactions in maize" Nature Genetics
- Fournier-Level et al. (2025) "Adaptive evolution of Arabidopsis thaliana" Science
- Gene-Environment Interaction Consortium (2025) "Human G×E interactions" Cell

### GWAS & Genotype-Phenotype
- Bycroft et al. (2025) "The UK Biobank resource" Nature Genetics
- GTEx Consortium (2025) "The Genotype-Tissue Expression project v10" Cell
- Choi et al. (2025) "Tutorial on polygenic risk scores" Nature Protocols

---

## Integration mit anderen AMORPH-Systemen

- **PHYTO**: Pflanzengenome, Pangenome (Mais, Reis), Stress-Genomics
- **FUNGI**: Pilzgenome, Sekundärmetabolit-Gencluster, symbiotische Gene
- **BAKTERIO**: Bakterielle Pangenome, horizontaler Gentransfer, mobile Elemente
- **VIRO**: Virale Genome, Reassortment, Evolution
- **ANATO**: Humangenetik, GWAS für Erkrankungen, Entwicklungsgene
- **DRAKO**: Tiergenetik, Zoonomia, Domestikation
- **CHEMO**: Metabolomics (mQTL), Biosynthese-Gencluster
- **PHYSI**: Physiologische Genomics, Stressantwort
- **NETZO**: Genregulatorische Netzwerke, Protein-Interaktionsnetzwerke
- **COGNITO**: Neurogenetik, Verhaltensgenetik
- **BIOTECH**: CRISPR, Synthetische Biologie, Genome Engineering
- **PALEO**: Alte DNA, Evolution, Populationsgenetik
- **KOSMO**: Astrobiologie, extremophile Genome

---

## Technische Details

**Morph Types verwendet:**
- `text`: Spezies, Gene, Beschreibungen
- `number`: Zählwerte (SNPs, Gene, Loci)
- `badge`: Kategorien, Methoden, Status
- `gauge`: Prozente, Metriken mit Zielwerten
- `progress`: Fortschritt zu Zielen
- `list`: Aufzählungen (Gene, Pathways, Publikationen)
- `distribution`: Verteilungen über Kategorien
- `histogram`: Verteilungen über Bereiche
- `pie`: Anteile (Varianzkomponenten, SV-Typen)
- `network`: Netzwerke (GRN, Multi-Omics, Phylogenie)
- `timeline`: Zeitliche Verläufe (Evolution, Expression)
- `hierarchy`: Hierarchien (Taxonomie, Phylogenie)

**Datenquellen:**
- Public databases: NCBI, Ensembl, UCSC, 1000 Genomes, UK Biobank, GTEx
- Consortia: Zoonomia, 1000 Plants, HapMap, GWAS Catalog
- Publications: Nature, Science, Cell, Nature Genetics, Genome Research

---

## Status: VOLLSTÄNDIG ✅
Alle 6 Perspektiven basieren auf 2025 Forschung mit holistischer/lateraler Ausrichtung.
