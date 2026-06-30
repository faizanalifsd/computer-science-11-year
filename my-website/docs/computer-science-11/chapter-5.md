---
id: chapter-5
title: "Chapter 5: Data Analytics"
sidebar_label: "Chapter 5: Data Analytics"
sidebar_position: 5
---

# Unit 5: Data Analytics

## Student Learning Outcomes

By the end of this chapter, students will be able to:

- Understand the role and importance of model building and their real-world applications.
- Build basic statistical models for real-world problems and evaluate their performance.
- Understand and explain the principles of experimental design in data science.
- Explain the types, uses, and methods of data visualizations.
- Understand the benefits of visualizing data through descriptive statistics.
- Create and interpret data visualizations using software such as MS Excel, Google Sheets, Python, Tableau, and Matplotlib.

---

## Introduction

Data analytics is the process of examining data to find useful information, patterns, and trends to support decision-making.

---

## 5.1 Basic Statistical Concepts

Statistics is a branch of mathematics that helps us understand and analyze data. By using statistics, large sets of information can be summarized in a simple way, making it easier to analyze and draw conclusions.

### 5.1.1 Measures of Central Tendency

Measures of central tendency help us identify the "center" or typical value in a dataset. There are three main measures: **mean**, **median**, and **mode**.

#### Mean

The mean is the average of all the numbers in a dataset. To calculate the mean, add all the numbers together and divide by the total number of values.

**Example:** 5 students scored 50, 60, 70, 80, and 90 in a test.

**Mean = (50 + 60 + 70 + 80 + 90) ÷ 5 = 350 ÷ 5 = 70**

#### Median

The median is the middle value in a dataset when numbers are arranged in order. If there is an odd number of values, the median is the exact middle. If even, it is the average of the two middle numbers.

**Example (odd):** Scores: 50, 60, **70**, 80, 90 → Median = **70**

**Example (even):** Scores: 50, 60, 70, 80 → Median = (60 + 70) / 2 = **65**

#### Mode

The mode is the number that appears most often in a dataset. There can be more than one mode.

**Example:** Scores: 50, 60, 70, 70, 90 → Mode = **70** (appears twice)

**Example (multiple modes):** Scores: 50, 60, 60, 70, 70, 90 → Modes = **60 and 70**

---

### 5.1.2 Measures of Dispersion

Measures of dispersion tell us how spread out or scattered the data is. Two common measures are **variance** and **standard deviation**.

#### 5.1.2.1 Variance

Variance shows how much the numbers in a dataset differ from the mean. A higher variance means numbers are more spread out; a lower variance means they are closer to the mean.

**Variance (σ²) = Σ(X − μ)² ÷ N**

Where: X = each value, μ = mean, N = total number of values.

**Example:** Compare the spread of two classes:

- **Class A:** 50, 52, 55, 57, 60
- **Class B:** 30, 45, 55, 75, 90

**Class A Calculation:**

Mean = (50 + 52 + 55 + 57 + 60) / 5 = **54.8**

| X | X − μ | (X − μ)² |
|---|-------|----------|
| 50 | −4.8 | 23.04 |
| 52 | −2.8 | 7.84 |
| 55 | 0.2 | 0.04 |
| 57 | 2.2 | 4.84 |
| 60 | 5.2 | 27.04 |

Variance (A) = (23.04 + 7.84 + 0.04 + 4.84 + 27.04) / 5 = **12.56**

**Class B Calculation:**

Mean = (30 + 45 + 55 + 75 + 90) / 5 = **59**

| X | X − μ | (X − μ)² |
|---|-------|----------|
| 30 | −29 | 841 |
| 45 | −14 | 196 |
| 55 | −4 | 16 |
| 75 | 16 | 256 |
| 90 | 31 | 961 |

Variance (B) = (841 + 196 + 16 + 256 + 961) / 5 = **454**

**Conclusion:** Class B has a much higher variance — scores are more spread out.

#### 5.1.2.2 Standard Deviation

Standard deviation is the square root of variance. It is in the same unit as the original data, making it more practical to interpret.

**σ = √[ Σ(X − μ)² ÷ N ]**

- Class A: σ = √12.56 ≈ **3.55** (scores closely packed around mean)
- Class B: σ = √454 ≈ **21.26** (scores widely scattered)

---

### 5.1.3 Introduction to Probability

Probability is the study of how likely an event is to happen.

**Probability = Number of favorable outcomes ÷ Total number of outcomes**

**Example:** Flipping a coin — two possible outcomes (heads or tails):
- P(Heads) = 1/2 = **50%**
- P(Tails) = 1/2 = **50%**

Probability is used in weather prediction, business decisions, and sports analysis.

:::info Do You Know?
Statistics is used in many everyday activities, such as predicting weather patterns or analyzing sports performance.
:::

:::note Class Activity
**Analyze a Small Dataset:**
1. Survey 10 classmates about hours spent on homework per week (0–20 hours).
2. Calculate Mean, Median, and Mode.
3. Calculate Variance and Standard Deviation.
4. Write a 3–4 sentence reflection on what the results reveal about study habits.
:::

---

## 5.2 Data Collection and Preparation

Data collection and preparation are crucial steps in any research or analysis. The quality and relevance of data directly impact the results and insights drawn from the study.

### 5.2.1 Data Collection Methods

#### 5.2.1.1 Surveys

Surveys involve asking a predefined set of questions to a sample group. They can be conducted via online forms, telephone calls, or face-to-face interviews.

**Example:** A grocery store in Islamabad wants to know customer preferences. They create a 5-question survey distributed to 50 customers over the weekend:

1. Which product categories do you buy most often?
2. Are there any products you would like to see more often?
3. How often do you shop at this store?
4. What influences your purchasing decisions most?
5. Any additional comments or suggestions?

#### 5.2.1.2 Observations

Observation involves collecting data by watching or monitoring subjects in their natural environment.

**Example:** A restaurant observes which tables are chosen most frequently during lunchtime over one week, then rearranges seating to optimize comfort and traffic flow.

#### 5.2.1.3 Experiments

Experiments involve manipulating one or more variables to determine their effect on another variable.

**Example:** A teacher tests whether printed notes improve exam scores by comparing two student groups — one receiving printed notes, the other relying only on lectures.

---

### 5.2.2 Data Preparation

Once data is collected, it must be prepared for analysis. This includes cleaning data to remove errors and converting it into a suitable format.

### 5.2.3 Data Cleaning and Transformation

#### 5.2.3.1 Data Cleaning

Data cleaning means correcting or removing errors, missing values, or duplicates.

**Table 5.1: Original Data with Errors**

| Name | Score | Class | Section |
|------|-------|-------|---------|
| Ali  | 84    | 10    | A       |
| Alie | 90    | 10    | A       |
| Sara | —     | 10    | A       |

**Table 5.2: Cleaned Data**

| Name | Score | Class | Section |
|------|-------|-------|---------|
| Ali  | 84    | 10    | A       |
| Ali  | 90    | 10    | A       |
| Sara | 87    | 10    | A       |

#### 5.2.3.2 Data Transformation

Once clean, data is often transformed into a more suitable format — such as aggregating individual scores into class-level statistics (averages, grade distributions).

#### 5.2.3.3 Handling Missing Data

Strategies for handling missing values:

1. **Imputation:** Estimate the missing value using existing data (e.g., assign the class average).
2. **Flagging:** Add a note in the dataset indicating the value is missing.
3. **Removal:** Exclude the record if missing entries are few and won't significantly affect analysis.

---

## 5.3 Building Statistical Models

### 5.3.1 Introduction to Statistical Modeling

Statistical modeling analyzes data to make sense of the real world and predict future outcomes.

#### 5.3.1.1 Model Development

Building a statistical model involves the following steps:

1. **Define the Problem:** Understand what you are trying to predict and which factors influence it.
2. **Collect Data:** Gather data related to the problem.
3. **Choose an Algorithm:** Select an appropriate method (e.g., linear regression, logistic regression).
4. **Train the Model:** The model learns from the collected data to make predictions.
5. **Evaluate the Model:** Test the model on new data to ensure accuracy.

#### 5.3.1.2 Linear Regression

Linear regression helps understand the relationship between two variables — predicting one based on another.

**Formula:**

**Y = β₀ + β₁X + ε**

Where:
- Y = dependent variable (e.g., daily earnings)
- X = independent variable (e.g., number of customers)
- β₀ = intercept (value of Y when X = 0)
- β₁ = slope (how much Y changes per unit change in X)
- ε = error term

**Example:** A fruit stall tracks customers and daily earnings:

**Table 5.3: Customer Data**

| Customers (X) | Daily Earnings (Rs.) |
|---------------|----------------------|
| 10 | 500 |
| 15 | 700 |
| 20 | 900 |
| 25 | 1,100 |
| 30 | 1,300 |

**Finding the slope (β₁):** Every 5 extra customers adds Rs. 200 → β₁ = 200/5 = **40**

**Finding the intercept (β₀):** Using the point (10 customers, Rs. 500):
500 = β₀ + (40 × 10) → β₀ = 500 − 400 = **100**

**Final Equation:**
**Earnings = 100 + 40 × Customers**

**Prediction:** If 22 customers visit tomorrow:
Earnings = 100 + (40 × 22) = **Rs. 980**

**Testing:** On day 6, 28 customers visited and earnings were Rs. 1,250.
- Predicted: 100 + (40 × 28) = Rs. 1,220
- Error = 1,220 − 1,250 = **−Rs. 30**

:::tip Tidbits
To improve your statistical model: use more data points, include relevant factors (family size, events), regularly update with new data, and test predictions against actual values.
:::

#### 5.3.1.3 Logistic Regression

Logistic regression predicts outcomes that are binary — "yes" or "no". Instead of predicting exact numbers, it provides a **probability value between 0 and 1**.

**Example:** Predict whether a student will pass or fail an exam based on hours studied.

#### 5.3.1.4 Clustering Techniques

Clustering groups similar items together based on their characteristics.

**Example:** Group students by performance in Math and English:

**Table 5.4: Student Scores for Clustering**

| Student | Math Score | English Score |
|---------|-----------|---------------|
| Basim   | 85        | 70            |
| Umer    | 90        | 65            |
| Anie    | 50        | 80            |
| Tallat  | 40        | 85            |
| Maliha  | 60        | 60            |

**K-Means Clustering:** Divide students into 2 clusters:
- **Cluster 1 (Strong in Math):** Basim, Umer
- **Cluster 2 (Strong in English):** Anie, Tallat

---

### 5.3.2 Evaluating and Interpreting Models

#### 5.3.2.1 Performance Metrics

- **Error Metrics:** Measure how much predictions differ from actual values.
- **Accuracy Metrics:** Measure the percentage of correct predictions.

#### 5.3.2.2 Interpreting Outputs

Interpreting a model means understanding what the results reveal. For example, if linear regression shows that study hours strongly affect exam scores, students should study more to improve.

#### 5.3.2.3 Ethical Considerations

- **Fairness and Bias:** Models must be fair and unbiased (e.g., a loan approval model should not unfairly favour any group).
- **Data Privacy:** Personal data used in models must be kept secure and not shared without permission.

---

## 5.4 Introduction to Data Visualization

Data visualization is the process of representing data in a visual format (graphs, charts) to quickly identify patterns, trends, and insights.

### 5.4.1 Types of Visualizations

#### 5.4.1.1 Bar Charts

Bar charts compare different categories. Each bar represents a category and its height indicates the value.

**Example:** Comparing sales figures for different products.

![Figure 5.1: Bar Chart showing sales figures of different products](/img/chapter-5/figure-5-1.svg)

*Figure 5.1: A bar chart showing sales figures of different products*

#### 5.4.1.2 Line Graphs

Line graphs show trends over time by plotting data points connected with a line.

**Example:** Tracking temperature changes over a day.

![Figure 5.2: Line graph showing temperature variation over time](/img/chapter-5/figure-5-2.svg)

*Figure 5.2: A line graph showing variation of temperature over time*

#### 5.4.1.3 Histograms

Histograms show the distribution of a dataset by grouping data into bins (intervals).

**Example:** Analyzing how students performed on a math exam.

![Figure 5.3: Histogram showing distribution of exam scores](/img/chapter-5/figure-5-3.svg)

*Figure 5.3: A histogram showing the distribution of exam scores*

#### 5.4.1.4 Scatterplots

Scatterplots display the relationship between two variables. Each point represents an observation.

**Example:** Relationship between hours studied and exam scores.

![Figure 5.4: Scatterplot showing relationship between hours studied and exam scores](/img/chapter-5/figure-5-4.svg)

*Figure 5.4: Scatterplot showing the relationship between hours studied and exam scores*

#### 5.4.1.5 Boxplots

Boxplots summarize data distribution by displaying the median, quartiles, and potential outliers.

**Example:** Comparing exam scores of different classes.

![Figure 5.5: Boxplot showing class score performance](/img/chapter-5/figure-5-5.svg)

*Figure 5.5: A boxplot showing class scores performance of three classes*

---

## 5.5 Tools for Data Visualization

### 5.5.1 Using Excel and Google Sheets

Excel and Google Sheets allow you to enter data and generate bar charts, line graphs, scatterplots, and more with just a few clicks.

### 5.5.2 Creating and Interpreting Visualizations

**Step-by-Step Guide (Excel / Google Sheets):**

1. **Enter Your Data:** Add data into the spreadsheet (e.g., months in one column, sales figures in another).
2. **Select the Data:** Highlight the cells you want to visualize.
3. **Choose a Chart Type:** Click "Insert" and select the chart type (bar, line, etc.).
4. **Customize the Chart:** Add labels to axes to make the chart clearer.
5. **Interpret the Chart:** Understand what the visualization reveals about your data.

---

## Exercise

### Multiple Choice Questions

1. An example of a basic statistical model:
   - **a) Linear Regression**
   - b) Neural Networks
   - c) Decision Trees
   - d) Support Vector Machines

2. The activity involved in experimental design in data science:
   - a) Creating visualizations
   - **b) Collecting and analyzing data systematically**
   - c) Writing code for machine learning
   - d) Building databases

3. A commonly used tool for creating data visualizations:
   - a) MS Excel
   - b) Python (Matplotlib)
   - c) Tableau
   - **d) All of the above**

4. The meaning of the slope in a linear regression model:
   - a) The intercept of the model
   - **b) The change in the dependent variable for a unit change in the independent variable**
   - c) The error term
   - d) The mean of the data

5. An example of a real-world application of statistical models:
   - **a) Predicting house prices**
   - b) Creating social media posts
   - c) Designing websites
   - d) Writing essays

6. Option not considered a benefit of data visualization:
   - a) Identifying trends and patterns
   - b) Communicating insights effectively
   - **c) Making data more complex**
   - d) Summarizing large datasets

7. Primary goal of K-Means Clustering:
   - a) To classify data into predefined categories
   - **b) To group data into clusters based on similarity**
   - c) To predict continuous outcomes
   - d) To reduce the dimensionality of data

8. The meaning of "K" in K-Means Clustering:
   - a) Number of features in the dataset
   - **b) Number of clusters to be formed**
   - c) Number of iterations required for convergence
   - d) Number of data points in the dataset

---

### Short Questions

1. What is the importance of building statistical models in real-world applications?
2. Name one basic statistical model used for predicting outcomes and explain its purpose.
3. List two types of data visualizations and describe when you would use each.
4. How does visualizing data help in understanding descriptive statistics?

---

### Long Questions

1. Explain the role and importance of statistical models in solving real-world problems.
2. Describe the steps involved in building a basic statistical model (e.g., linear regression). Include details on data collection, model training, and evaluation.
3. Discuss the types of data visualizations and their uses.
4. Explain data collection methods.
5. Discuss the concept of measures of central tendency with examples.
