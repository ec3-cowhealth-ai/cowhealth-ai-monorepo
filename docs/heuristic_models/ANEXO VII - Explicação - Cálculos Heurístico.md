## 1. **Doença Respiratória Bovina (DRB)**

### **Variáveis necessárias**:

-   `avg_temp` (temperatura média corporal)
    
-   `avg_hr` (frequência cardíaca média)
    
-   Nível de **atividade**
    

### **Fórmula matemática:**

$$DRB(x) = \begin{cases} 1, & \text{se } \overline{T}_{30}(x) > 39{,}3 \land \overline{HR}_{30}(x) > 90 \land Atividade(x) = \text{"baixa"} \\ 0, & \text{caso contrário} \end{cases}$$

### **Como calcular:**

-   `avg_temp`: média da temperatura medida por 30 amostras consecutivas do sensor MLX90614.
    
-   `avg_hr`: média de 30 leituras do sensor MAX30102.
    
-   Atividade baixa: aceleração total abaixo de um limiar por mais de 30 minutos. A aceleração pode ser calculada por:
    
    $$A_{total} = \sqrt{a_x^2 + a_y^2 + a_z^2}$$

### **Fonte científica:**

-   [B 1442_1, University of Georgia]: temperatura >39,3 °C e aumento na frequência cardíaca indicam febre e estresse respiratório.
    
-   [Lindahl et al., 2015]: baixa movimentação associada a infecção respiratória.
    

----------

## 2. **Mastite Sistêmica**

### **Variável necessária**:

-   Padrão de **postura** anormal
    

### **Fórmula matemática:**

$$Mastite(x) = \begin{cases} 1, & T(x) > 39{,}5 \land HR(x) > 110 \land Postura(x) = \text{"anormal"} \\ 0, & \text{caso contrário} \end{cases}$$

### **Como calcular:**

-   "Postura anormal" ocorre quando o animal se mantém por longos períodos sem deitar ou adota inclinação irregular captada por giroscópio.
    
-   O sensor MPU6050 capta mudanças no ângulo de inclinação:  
    Se o eixo z permanece com valores < 0,3g por mais de 2 horas = possível dor associada.
    

### **Fonte científica:**

-   [Lameness_Pain_Behavior]: vacas com mastite passam menos tempo deitadas.
    
-   [Cook & Nordlund, 2004]: dor altera comportamento postural de forma mensurável.
    

----------

## 3. **Cetose (Doença metabólica)**

### **Variáveis necessárias**:

-   `hr_variabilidade` (variabilidade da frequência cardíaca)
    
-   Atividade baixa
    
-   Temperatura corporal
    

### **Fórmula matemática:**

$$Cetose(x) = \begin{cases} 1, & Desvio(HR) > \theta \land Atividade(x) = \text{"baixa"} \land T(x) < 38{,}0 \\ 0, & \text{caso contrário} \end{cases}$$

### **Como calcular:**

-   `hr_variabilidade` = desvio padrão das últimas 30 medições de HR.
    
-   Atividade baixa: aceleração total < 0,2g por mais de 1 hora.
    
-   Temperatura < 38 °C captada pelo MLX90614 pode indicar metabolismo deprimido.
    

### **Fonte científica:**

-   [APSC-167]: cetose leva à letargia e flutuação da FC.
    
-   [UtahStateDairyVet]: hipotermia moderada pode ocorrer em vacas com distúrbios metabólicos.
    

----------

## 4. **Estresse Térmico**

### **Variáveis necessárias**:

-   Temperatura corporal
    
-   Frequência cardíaca
    
-   Padrão de **movimento inquieto**
    

### **Fórmula matemática:**

$$Estresse(x) = \begin{cases} 1, & T(x) > 39{,}0 \land HR(x) > 100 \land Movimento(x) = \text{"inquieto"} \\ 0, & \text{caso contrário} \end{cases}$$

### **Como calcular:**

-   Movimento inquieto = >15 variações bruscas em aceleração nos últimos 5 minutos.
    
-   Pode ser identificado por pico de variação em `a_x` e `a_y`.
    

### **Fonte científica:**

-   [B 1442_1]: estresse térmico leva à hiperatividade momentânea.
    
-   [Grandin, 2012]: ambientes quentes e mal ventilados provocam irritabilidade.
    

----------

## 5. **Claudicação (Problemas nos cascos)**

### **Variáveis necessárias**:

-   Assimetria da marcha (`marcha_assimetrica`)
    
-   Postura anormal
    
-   FC elevada
    

### **Fórmula matemática:**

$$Claudicacao(x) = \begin{cases} 1, & Assimetria_{marcha} > \theta_{gait} \land Postura = \text{"incomum"} \land HR > 90 \\ 0, & \text{caso contrário} \end{cases}$$

### **Como calcular:**

-   `marcha_assimetrica`: diferença entre aceleração em passos do lado esquerdo e direito.
    
-   Necessário calibrar individualmente por animal.
    
-   Sensor MPU6050 identifica marcha assimétrica com padrão de aceleração assimétrico em `a_x`.
    

### **Fonte científica:**

-   [Lameness_Pain_Behavior]: claudicação afeta simetria da marcha.
    
-   [Huxley, 2007]: dor afeta padrão locomotor e FC.
    

----------

## 6. **Parto iminente**

### **Variáveis necessárias**:

-   Número de **mudanças posturais**
    
-   FC
    
-   Queda de temperatura
    

### **Fórmula matemática:**

$$Parto(x) = \begin{cases} 1, & Mudanças_{postura}(x) > 10 \text{ em 1h} \land HR > 90 \land \Delta T < 0 \\ 0, & \text{caso contrário} \end{cases}$$

### **Como calcular:**

-   Mudanças posturais = contagem de transições sentada/em pé via sensor giroscópio (eixo z).
    
-   Queda de temperatura: MLX90614 registra declínio nas últimas 12 horas.
    

### **Fonte científica:**

-   [Cook & Nordlund, 2004]: vacas inquietas no pré-parto mudam de postura com frequência.
    
-   [Lindahl et al., 2015]: pré-parto está associado à redução de temperatura retal.
    

----------

## 7. **Desidratação ou Choque**

### **Variáveis necessárias**:

-   Saturação de oxigênio (SpO₂)
    
-   FC
    
-   Temperatura de extremidades
    
-   Letargia
    

### **Fórmula matemática:**

$$Choque(x) = \begin{cases} 1, & SpO_2 < 88 \land HR > 120 \land T_{ext} < 35{,}0 \land Atividade = \text{"letárgica"} \\ 0, & \text{caso contrário} \end{cases}$$

### **Como calcular:**

-   Letargia: <10 movimentos por hora detectados via acelerômetro.
    
-   Temperatura das extremidades: medida por MLX90614 com sensor posicionado em membros.
    

### **Fonte científica:**

-   [UtahStateDairyVet]: vacas em choque reduzem fluxo nas extremidades e tornam-se imóveis.
    
-   [APSC-167]: SpO₂ <88% = hipóxia crítica.
    

----------

## 8. **Escala de Severidade – Atividade**

### **Categorização:**

-   Atividade = “normal”, “baixa” ou “letárgica”
    

$$Escore_{atividade}(x) = \begin{cases} 3, & \text{"letárgica"} \\ 2, & \text{"baixa"} \\ 1, & \text{"normal"} \\ 0, & \text{"ativa"} \end{cases}$$

### **Como calcular:**

-   **Letárgica**: <10 movimentos/hora
    
-   **Baixa**: 10–30 movimentos/hora
    
-   **Normal**: 31–60
    
-   **Ativa**: >60  
    Todos medidos por MPU6050 com janela de 1 hora.
    

----------