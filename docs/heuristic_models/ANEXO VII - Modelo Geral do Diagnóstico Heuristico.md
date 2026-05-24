## **General Heuristic Diagnosis Model**

Each disease or condition will be represented by a **binary function** `D(x) ∈ {0, 1}`, where `x` represents the animal's data at time `t`.

The rule can be expressed as:

$$D(x) = \begin{cases} 1, & \text{if logical conditions are true} \\ 0, & \text{otherwise} \end{cases}$$

## **1. Bovine Respiratory Disease (BRD)**

### **LaTeX Formula**


$$\text{BRD}(x) = \begin{cases} 1, & \overline{T}_{30}(x) > 39.3 \land \overline{HR}_{30}(x) > 90 \land SpO_2(x) < 92 \land A(x) = \text{“low”} \\ 0, & \text{otherwise} \end{cases}$$


### **PHP (key logic)**

```php
if (avg_temp > 39.3 && avg_hr > 90 && $spo2 < 92 && $atividade == "low") {
    $diagnosticos[] = "Suspected BRD";
}

```

## **2. Systemic Mastitis**

### **LaTeX Formula**

$$\text{Mastitis}(x) = \begin{cases} 1, & T(x) > 39.3 \land HR(x) > 110 \land P(x) = \text{“abnormal”} \\ 0, & \text{otherwise} \end{cases}$$

### **PHP**

```php
if ($temp > 39.3 && $hr > 110 && $postura == "abnormal") {
    $diagnosticos[] = "Suspected systemic mastitis";
}

```

## **3. Ketosis**

### **LaTeX Formula**

$$\text{Ketosis}(x) = \begin{cases} 1, & HR_{var}(x) > \theta \land A(x) = \text{“low”} \land T(x) < 38.0 \\ 0, & \text{otherwise} \end{cases}$$

> Where:  
> $HR_{var}(x) = \text{heart rate standard deviation in the last 30 min}$

### **PHP**

```php
if ($hr_variabilidade > 12 && $atividade == "low" && $temp < 38.0) {
    $diagnosticos[] = "Early stage ketosis";
}

```

## **4. Heat Stress**

### **LaTeX Formula**

$$\text{Stress}(x) = \begin{cases} 1, & T(x) > 39.0 \land HR(x) > 100 \land M(x) = \text{“restless”} \\ 0, & \text{otherwise} \end{cases}$$

### **PHP**

```php
if ($temp > 39.0 && $hr > 100 && $movimento == "restless") {
    $diagnosticos[] = "Heat stress";
}

```

## **5. Lameness**

### **LaTeX Formula**

$$\text{Lameness}(x) = \begin{cases} 1, & M_{assim}(x) > \theta_{gait} \land P(x) = \text{“unusual”} \land HR(x) > 90 \\ 0, & \text{otherwise} \end{cases}$$

> $M_{assim}(x)$: gait asymmetry index obtained from the accelerometer/gyroscope

### **PHP**

```php
if ($marcha_assimetrica && $postura == "unusual" && $hr > 90) {
    $diagnosticos[] = "Lameness with pain";
}

```

## **6. Imminent Calving**

### **LaTeX Formula**

$$\text{PreCalving}(x) = \begin{cases} 1, & \Delta P(x) > 3 \land HR(x) > 90 \land \nabla T(x) < 0 \\ 0, & \text{otherwise} \end{cases}$$

> $\Delta P(x)$: number of postural changes in the last 3 hours  
> $\nabla T(x)$: temperature drop in the last 12h

### **PHP**

```php
if ($mudancas_posturais > 3 && $hr > 90 && $temp_12h < $temp_24h) {
    $diagnosticos[] = "Imminent calving (12–24h)";
}

```

## **7. Dehydration or Shock**

### **LaTeX Formula**

$$\text{Shock}(x) = \begin{cases} 1, & SpO_2(x) < 88 \land HR(x) > 120 \land T_{ext}(x) < 35.0 \land A(x) = \text{“lethargic”} \\ 0, & \text{otherwise} \end{cases}$$

### **PHP**

```php
if ($spo2 < 88 && $hr > 120 && $temp_extremidades < 35.0 && $atividade == "lethargic") {
    $diagnosticos[] = "Possible shock or dehydration";
}

```

## **8. Scalar Severity (Multipoint)**

### **LaTeX Formula**

$$\text{Risk}(x) = \sum_{i=1}^{n} w_i \cdot \mathbb{1}_{\{cond_i\}}$$

> Where:
> 
> -   $w_i$: symptom weight
>     
> -   $\mathbb{1}_{\{cond_i\}}$: 1 if condition true, 0 otherwise
>     

### **PHP (scoring)**

```php
$risco = 0;
if ($temp > 39.3) $risco += 1;
if ($hr > 90) $risco += 1;
if ($spo2 < 92) $risco += 1;
if ($atividade == "low") $risco += 1;

if ($risco >= 3) $diagnosticos[] = "High risk of respiratory infection";

```

----------
