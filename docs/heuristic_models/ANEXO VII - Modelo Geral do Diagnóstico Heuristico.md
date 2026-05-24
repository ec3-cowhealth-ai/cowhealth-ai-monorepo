## **Modelo Geral do Diagnóstico Heurístico**

Cada doença ou condição será representada por uma **função binária** `D(x) ∈ {0, 1}`, onde `x` representa os dados do animal em tempo `t`.

A regra pode ser expressa como:

$$D(x) = \begin{cases} 1, & \text{se condições lógicas forem verdadeiras} \\ 0, & \text{caso contrário} \end{cases}$$

## **1. Doença Respiratória Bovina (BRD)**

### **Fórmula LaTeX**


$$\text{BRD}(x) = \begin{cases} 1, & \overline{T}_{30}(x) > 39.3 \land \overline{HR}_{30}(x) > 90 \land SpO_2(x) < 92 \land A(x) = \text{“baixo”} \\ 0, & \text{caso contrário} \end{cases}$$


### **PHP (lógica-chave)**

```php
if (avg_temp > 39.3 && avg_hr > 90 && $spo2 < 92 && $atividade == "baixo") {
    $diagnosticos[] = "BRD suspeita";
}

```

## **2. Mastite Sistêmica**

### **Fórmula LaTeX**

$$\text{Mastite}(x) = \begin{cases} 1, & T(x) > 39.3 \land HR(x) > 110 \land P(x) = \text{“anormal”} \\ 0, & \text{caso contrário} \end{cases}$$

### **PHP**

```php
if ($temp > 39.3 && $hr > 110 && $postura == "anormal") {
    $diagnosticos[] = "Mastite sistêmica suspeita";
}

```

## **3. Cetose**

### **Fórmula LaTeX**

$$\text{Cetose}(x) = \begin{cases} 1, & HR_{var}(x) > \theta \land A(x) = \text{“baixo”} \land T(x) < 38.0 \\ 0, & \text{caso contrário} \end{cases}$$

> Onde:  
> $HR_{var}(x) = \text{desvio padrão da frequência cardíaca nos últimos 30 min}$

### **PHP**

```php
if ($hr_variabilidade > 12 && $atividade == "baixo" && $temp < 38.0) {
    $diagnosticos[] = "Cetose em estágio inicial";
}

```

## **4. Estresse Térmico**

### **Fórmula LaTeX**

$$\text{Estresse}(x) = \begin{cases} 1, & T(x) > 39.0 \land HR(x) > 100 \land M(x) = \text{“inquieto”} \\ 0, & \text{caso contrário} \end{cases}$$

### **PHP**

```php
if ($temp > 39.0 && $hr > 100 && $movimento == "inquieto") {
    $diagnosticos[] = "Estresse térmico";
}

```

## **5. Claudicação (Lameness)**

### **Fórmula LaTeX**

$$\text{Claudicacao}(x) = \begin{cases} 1, & M_{assim}(x) > \theta_{gait} \land P(x) = \text{“incomum”} \land HR(x) > 90 \\ 0, & \text{caso contrário} \end{cases}$$

> $M_{assim}(x)$: índice de assimetria na marcha obtido do acelerômetro/giroscópio

### **PHP**

```php
if ($marcha_assimetrica && $postura == "incomum" && $hr > 90) {
    $diagnosticos[] = "Claudicação com dor";
}

```

## **6. Parto Iminente**

### **Fórmula LaTeX**

$$\text{PreParto}(x) = \begin{cases} 1, & \Delta P(x) > 3 \land HR(x) > 90 \land \nabla T(x) < 0 \\ 0, & \text{caso contrário} \end{cases}$$

> $\Delta P(x)$: número de mudanças de postura nas últimas 3 horas  
> $\nabla T(x)$: queda de temperatura nas últimas 12h

### **PHP**

```php
if ($mudancas_posturais > 3 && $hr > 90 && $temp_12h < $temp_24h) {
    $diagnosticos[] = "Parto iminente (12–24h)";
}

```

## **7. Desidratação ou Choque**

### **Fórmula LaTeX**

$$\text{Choque}(x) = \begin{cases} 1, & SpO_2(x) < 88 \land HR(x) > 120 \land T_{ext}(x) < 35.0 \land A(x) = \text{“letárgico”} \\ 0, & \text{caso contrário} \end{cases}$$

### **PHP**

```php
if ($spo2 < 88 && $hr > 120 && $temp_extremidades < 35.0 && $atividade == "letárgico") {
    $diagnosticos[] = "Possível choque ou desidratação";
}

```

## **8. Severidade Escalar (Multiponto)**

### **Fórmula LaTeX**

$$\text{Risco}(x) = \sum_{i=1}^{n} w_i \cdot \mathbb{1}_{\{cond_i\}}$$

> Onde:
> 
> -   $w_i$: peso do sintoma
>     
> -   $\mathbb{1}_{\{cond_i\}}$: 1 se condição verdadeira, 0 caso contrário
>     

### **PHP (escoring)**

```php
$risco = 0;
if ($temp > 39.3) $risco += 1;
if ($hr > 90) $risco += 1;
if ($spo2 < 92) $risco += 1;
if ($atividade == "baixo") $risco += 1;

if ($risco >= 3) $diagnosticos[] = "Risco elevado de infecção respiratória";

```

----------
