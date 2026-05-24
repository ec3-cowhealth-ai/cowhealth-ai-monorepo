## 1. **Bovine Respiratory Disease (BRD)**

### **Required variables**:

-   `avg_temp` (average body temperature)
    
-   `avg_hr` (average heart rate)
    
-   **Activity** level
    

### **Mathematical formula:**

$$BRD(x) = \begin{cases} 1, & \text{if } \overline{T}_{30}(x) > 39.3 \land \overline{HR}_{30}(x) > 90 \land Activity(x) = \text{"low"} \\ 0, & \text{otherwise} \end{cases}$$

### **How to calculate:**

-   `avg_temp`: average temperature measured by 30 consecutive samples from the MLX90614 sensor.
    
-   `avg_hr`: average of 30 readings from the MAX30102 sensor.
    
-   Low activity: total acceleration below a threshold for more than 30 minutes. Acceleration can be calculated by:
    
    $$A_{total} = \sqrt{a_x^2 + a_y^2 + a_z^2}$$

### **Scientific source:**

-   [B 1442_1, University of Georgia]: temperature >39.3 °C and increased heart rate indicate fever and respiratory stress.
    
-   [Lindahl et al., 2015]: low movement associated with respiratory infection.
    

----------

## 2. **Systemic Mastitis**

### **Required variable**:

-   Abnormal **posture** pattern
    

### **Mathematical formula:**

$$Mastitis(x) = \begin{cases} 1, & T(x) > 39.5 \land HR(x) > 110 \land Posture(x) = \text{"abnormal"} \\ 0, & \text{otherwise} \end{cases}$$

### **How to calculate:**

-   "Abnormal posture" occurs when the animal remains for long periods without lying down or adopts an irregular tilt captured by gyroscope.
    
-   The MPU6050 sensor captures changes in the tilt angle:  
    If the z-axis remains with values < 0.3g for more than 2 hours = possible associated pain.
    

### **Scientific source:**

-   [Lameness_Pain_Behavior]: cows with mastitis spend less time lying down.
    
-   [Cook & Nordlund, 2004]: pain alters postural behavior in a measurable way.
    

----------

## 3. **Ketosis (Metabolic disease)**

### **Required variables**:

-   `hr_variability` (heart rate variability)
    
-   Low activity
    
-   Body temperature
    

### **Mathematical formula:**

$$Ketosis(x) = \begin{cases} 1, & Dev(HR) > \theta \land Activity(x) = \text{"low"} \land T(x) < 38.0 \\ 0, & \text{otherwise} \end{cases}$$

### **How to calculate:**

-   `hr_variability` = standard deviation of the last 30 HR measurements.
    
-   Low activity: total acceleration < 0.2g for more than 1 hour.
    
-   Temperature < 38 °C captured by the MLX90614 may indicate depressed metabolism.
    

### **Scientific source:**

-   [APSC-167]: ketosis leads to lethargy and HR fluctuation.
    
-   [UtahStateDairyVet]: moderate hypothermia can occur in cows with metabolic disorders.
    

----------

## 4. **Heat Stress**

### **Required variables**:

-   Body temperature
    
-   Heart rate
    
-   **Restless movement** pattern
    

### **Mathematical formula:**

$$Stress(x) = \begin{cases} 1, & T(x) > 39.0 \land HR(x) > 100 \land Movement(x) = \text{"restless"} \\ 0, & \text{otherwise} \end{cases}$$

### **How to calculate:**

-   Restless movement = >15 sudden variations in acceleration in the last 5 minutes.
    
-   Can be identified by peak variation in `a_x` and `a_y`.
    

### **Scientific source:**

-   [B 1442_1]: heat stress leads to momentary hyperactivity.
    
-   [Grandin, 2012]: hot and poorly ventilated environments cause irritability.
    

----------

## 5. **Lameness (Hoof problems)**

### **Required variables**:

-   Gait asymmetry (`marcha_assimetrica`)
    
-   Abnormal posture
    
-   Elevated HR
    

### **Mathematical formula:**

$$Lameness(x) = \begin{cases} 1, & Gait_{asymmetry} > \theta_{gait} \land Posture = \text{"unusual"} \land HR > 90 \\ 0, & \text{otherwise} \end{cases}$$

### **How to calculate:**

-   `marcha_assimetrica`: difference between acceleration in steps of the left and right sides.
    
-   Individual calibration per animal required.
    
-   MPU6050 sensor identifies asymmetric gait with an asymmetric acceleration pattern in `a_x`.
    

### **Scientific source:**

-   [Lameness_Pain_Behavior]: lameness affects gait symmetry.
    
-   [Huxley, 2007]: pain affects locomotor pattern and HR.
    

----------

## 6. **Imminent Calving**

### **Required variables**:

-   Number of **postural changes**
    
-   HR
    
-   Temperature drop
    

### **Mathematical formula:**

$$Calving(x) = \begin{cases} 1, & Postural\_changes(x) > 10 \text{ in 1h} \land HR > 90 \land \Delta T < 0 \\ 0, & \text{otherwise} \end{cases}$$

### **How to calculate:**

-   Postural changes = count of sitting/standing transitions via gyroscope sensor (z-axis).
    
-   Temperature drop: MLX90614 records decline in the last 12 hours.
    

### **Scientific source:**

-   [Cook & Nordlund, 2004]: restless cows in pre-calving change posture frequently.
    
-   [Lindahl et al., 2015]: pre-calving is associated with a reduction in rectal temperature.
    

----------

## 7. **Dehydration or Shock**

### **Required variables**:

-   Oxygen saturation (SpO₂)
    
-   HR
    
-   Extremity temperature
    
-   Lethargy
    

### **Mathematical formula:**

$$Shock(x) = \begin{cases} 1, & SpO_2 < 88 \land HR > 120 \land T_{ext} < 35.0 \land Activity = \text{"lethargic"} \\ 0, & \text{otherwise} \end{cases}$$

### **How to calculate:**

-   Lethargy: <10 movements per hour detected via accelerometer.
    
-   Extremity temperature: measured by MLX90614 with sensor positioned on limbs.
    

### **Scientific source:**

-   [UtahStateDairyVet]: cows in shock reduce flow in extremities and become immobile.
    
-   [APSC-167]: SpO₂ <88% = critical hypoxia.
    

----------

## 8. **Severity Scale – Activity**

### **Categorization:**

-   Activity = “normal”, “low” or “lethargic”
    

$$Activity_{score}(x) = \begin{cases} 3, & \text{"lethargic"} \\ 2, & \text{"low"} \\ 1, & \text{"normal"} \\ 0, & \text{"active"} \end{cases}$$

### **How to calculate:**

-   **Lethargic**: <10 movements/hour
    
-   **Low**: 10–30 movements/hour
    
-   **Normal**: 31–60
    
-   **Active**: >60  
    All measured by MPU6050 with a 1-hour window.
    

----------