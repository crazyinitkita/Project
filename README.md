#  CyberSentinel AI
### AI-Powered Network Intrusion Detection and Threat Explanation System

CyberSentinel AI is an AI-assisted cybersecurity project that analyzes network-flow data, classifies potentially malicious traffic using machine learning, and generates human-readable explanations using a large language model (LLM).

The project combines a Random Forest classifier, a backend API, and an AI explanation component to help users understand network intrusion classification results through an interactive dashboard.

CyberSentinel AI is currently a **demonstration and analysis system**, not a complete live network-monitoring or automated threat-prevention product.

##  Project Overview

Network intrusion detection systems can produce technical alerts that are difficult for users to interpret. CyberSentinel AI aims to make these results more understandable by combining machine-learning-based traffic classification with AI-generated explanations.

The system uses the CIC-IDS2017 dataset for data preparation and model development. The trained Random Forest model classifies compatible network-flow records, while the backend coordinates inference and explanation requests.

The language-model component, using Gemini or Gemma depending on the configured integration, explains the classifier's result using the information supplied to it. If the AI service is unavailable, the application may use a fallback explanation.

The project focuses on making network traffic classification easier to understand while maintaining a clear distinction between model predictions and AI-generated explanations.

##  Project Objectives

- Analyze labeled network traffic using machine learning.
- Classify network-flow records into supported traffic categories.
- Build a data cleaning and validation pipeline.
- Train and evaluate a Random Forest classification model.
- Develop backend APIs for prediction and explanation workflows.
- Integrate Gemini/Gemma for natural-language explanations.
- Display predictions and explanations through a frontend dashboard.
- Help users understand suspicious traffic classifications.
- Clearly communicate the limitations of AI-assisted intrusion analysis.

##  Key Features

### 1. Dataset Cleaning and Validation

- Processes network traffic datasets in CSV format.
- Checks dataset quality and row totals.
- Inspects feature columns and class labels.
- Investigates class distributions and rare attack categories.
- Verifies the processed dataset before model training.

### 2. Machine Learning and Model Training

- Uses the CIC-IDS2017 dataset for supervised learning.
- Prepares network-flow features for classification.
- Uses a Random Forest classifier.
- Supports evaluation of model predictions.
- Provides a foundation for analyzing benign and malicious traffic categories.

### 3. Network Traffic Classification

- Accepts compatible network-flow feature records through the implemented application workflow.
- Uses the trained model to predict a traffic category.
- Returns classification results for further analysis.
- Provides the classifier's output to the explanation component.

### 4. AI-Powered Threat Explanation

- Uses Gemini/Gemma, depending on the configured service, to explain classifier results.
- Produces human-readable explanations based on supplied prediction details and evidence.
- Helps users interpret technical model output.
- Uses a fallback explanation when the AI service is unavailable, where implemented.

**Important:** The language model explains the classifier's result. It does not independently perform the underlying intrusion detection.

### 5. Backend API

- Receives and processes application requests.
- Coordinates model inference and explanation generation.
- Handles communication between the frontend and analysis components.
- Returns prediction results and explanations to the frontend.

### 6. Interactive Dashboard

- Presents classification results in a user-friendly interface.
- Displays AI-generated or fallback explanations.
- Helps users review the analysis performed during a demonstration session.

### 7. Dataset Investigation Utilities

The repository includes scripts for:

- Data-quality checks.
- Row-total verification.
- Dataset and feature inspection.
- Label comparison.
- Investigation of individual and overall class distributions.
- Final dataset and processed-label verification.

##  System Architecture

```text
              CIC-IDS2017 Dataset
                       |
                       v
              Data Preprocessing
                       |
                       v
              Feature Preparation
                       |
                       v
             Random Forest Training
                       |
                       v
                Trained Model
                       |
                       v
User / Dashboard ---> Backend API
                       |
                       v
              Input Validation
                       |
                       v
              Model Prediction
                       |
                       v
              Predicted Label
              + Model Score
                       |
                       v
             Gemini / Gemma Service
                       |
                +------+------+
                |             |
           AI Available   AI Unavailable
                |             |
                v             v
         AI Explanation   Fallback Explanation
                |             |
                +------+------+
                       |
                       v
                Backend Response
                       |
                       v
                Frontend Dashboard
```

The architecture above describes the intended application flow. The actual fallback behavior, model-score fields, and service integration should match the implementation in the repository.

## How the System Works

1. **Dataset preparation:** Network traffic records are cleaned, inspected, and validated.
2. **Feature preparation:** Network-flow features are prepared for model training.
3. **Model training:** A Random Forest classifier learns from labeled network traffic.
4. **Model evaluation:** The trained model is evaluated using appropriate classification metrics.
5. **Input submission:** A compatible feature record is submitted through the application.
6. **Classification:** The backend uses the trained model to obtain a predicted traffic category and, where available, a model score.
7. **Explanation generation:** The application supplies the prediction and relevant evidence to Gemini/Gemma.
8. **Fallback handling:** If the configured AI service is unavailable, the application may return a fallback explanation.
9. **Result display:** The dashboard presents the classification and its explanation to the user.

This workflow describes analysis of supplied network-flow data. It does not imply that the application captures live network packets automatically.

##  Machine Learning Component

### Random Forest Classifier

Random Forest is a supervised machine-learning algorithm that combines multiple decision trees to produce a classification.

In CyberSentinel AI, it is used to classify network-flow records into categories represented in its training data.

The model's predictions depend on the quality of the dataset, the selected features, preprocessing, training configuration, and class distribution.

### Model Evaluation

Useful metrics for evaluating the classifier include:

- **Accuracy:** The proportion of all predictions that are correct.
- **Precision:** The proportion of predictions for a class that are correct.
- **Recall:** The proportion of records belonging to a class that are correctly identified.
- **F1-score:** A measure combining precision and recall.
- **Confusion matrix:** A breakdown of correct and incorrect predictions for each class.

Because intrusion-detection datasets can have severe class imbalance, per-class precision, recall, and F1-scores are important. High overall accuracy does not necessarily mean that rare attacks can be detected reliably.

### Understanding the Model Score

A model score or class score must not automatically be interpreted as a calibrated probability that an attack is occurring.

Unless calibration has been explicitly implemented and evaluated, the score should be presented as a model output rather than a reliable real-world probability of an intrusion.

Actual evaluation metrics should be added to this README only after verifying the results produced by the completed training and evaluation pipeline.

##  Role of Gemini/Gemma

The language-model component makes classification results easier to interpret.

Depending on the information provided by the application, it may receive:

- The predicted traffic category.
- Relevant network-flow feature values.
- Supporting evidence from the analysis pipeline.
- The model score, if available.
- Context about the limitations of the prediction.

The language model uses this information to generate an explanation intended to help the user understand the classification.

### Machine Learning vs. Language Model

| Component | Responsibility |
|---|---|
| Random Forest | Classifies network-flow records |
| Backend API | Coordinates requests, inference, and responses |
| Gemini/Gemma | Explains the classifier's result |
| Fallback explanation | Provides an alternative response when the AI service is unavailable, if implemented |
| Frontend dashboard | Displays predictions and explanations |

The language model does not replace the classifier. An explanation generated by an LLM is not proof that an attack has occurred and must not introduce unsupported claims about the network traffic.

##  Dataset

CyberSentinel AI uses the CIC-IDS2017 dataset, a publicly available benchmark containing benign network traffic and simulated attack traffic.

The dataset preparation process previously reported the following statistics:

| Dataset property | Reported value |
|---|---:|
| Cleaned records | 2,827,876 |
| CSV files | 8 |
| Feature columns | 78 |
| Label column | 1 |
| Traffic classes | 15 |
| Invalid feature rows removed | 2,867 |

These figures should be checked against the final processed dataset before being treated as definitive results.

### Dataset Considerations

- Traffic classes are imbalanced.
- Some attack categories have very few examples.
- Performance on a benchmark dataset does not guarantee the same performance on real-world networks.
- The training and inference pipelines must use compatible feature columns, ordering, and preprocessing.
- Dataset files are not included in the public repository because of their size.

**Official dataset:** [CIC-IDS2017 — Canadian Institute for Cybersecurity](https://www.unb.ca/cic/datasets/ids-2017.html)

Download the dataset from the official source and configure the file paths expected by the preprocessing and training scripts.

##  Technology Stack

The following table describes the technologies used or planned in the project architecture. Verify names and versions against the actual implementation before publishing.

| Technology | Purpose |
|---|---|
| Python | Data preparation and machine learning |
| pandas | Dataset manipulation |
| NumPy | Numerical operations |
| scikit-learn | Random Forest training and evaluation |
| Gemini/Gemma | Natural-language explanations, depending on configuration |
| Node.js | Backend runtime, if used |
| Express.js | Backend API framework, if used |
| React | Frontend user interface, if used |
| Tailwind CSS | Frontend styling, if used |
| Git and GitHub | Version control and source-code hosting |

##  Project Structure

The following structure includes the dataset scripts present in the public repository and illustrative locations for the other project components. Keep only the paths that match the actual repository.

```text
CyberSentinel-AI/
│
├── README.md
├── requirements.txt
├── LICENSE
│
├── scripts/
│   ├── check_data_quality.py
│   ├── check_row_totals.py
│   ├── clean_dataset.py
│   ├── compare_labels.py
│   ├── inspect_dataset.py
│   ├── inspect_features.py
│   ├── investigate_all_classes.py
│   ├── investigate_class.py
│   ├── verify_final_dataset.py
│   └── verify_processed_labels.py
│
├── ml/                 # If present
│   ├── training/
│   ├── evaluation/
│   └── models/
│
├── backend/            # If present
│   ├── routes/
│   ├── controllers/
│   └── services/
│
└── frontend/           # If present
    ├── src/
    └── public/
```

##  Getting Started

### Prerequisites
- Python and Git
- CIC-IDS2017 dataset
- Node.js and npm, if required by the application

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/crazyinitkita/Project.git
   cd Project
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Download the CIC-IDS2017 dataset and configure the required file paths.

4. Follow the project's configuration instructions to run the ML model, backend, and frontend.

**Note:** Dataset files are not included in the repository. Additional setup may be required to run the complete application.

Open the local URL printed by the frontend development server.

These commands depend on the actual project structure and configured scripts. Do not assume that the example paths exist without checking your repository.

## Limitations and Scope

**CyberSentinel AI is not yet a full live network-monitoring product.** It is a demonstration and analysis system with specific limitations that users and evaluators should understand.

### 1. No Live Packet Capture

The system does not currently capture network packets directly from a live network. It analyzes network-flow feature records supplied through the implemented application workflow.

Real-time monitoring would require an additional packet-capture or network-flow collection pipeline.

### 2. No Automatic Attack Blocking

CyberSentinel AI does not automatically block suspicious connections, terminate sessions, or change firewall rules.

The system provides classification and explanation results to support human review. It should not be described as an automated prevention or response system.

### 3. History Is Local to the Demo Session

Analysis history is limited to the local demonstration session rather than being shared across an entire organization.

The project should not be described as providing organization-wide incident history, centralized security logging, or persistent multi-user incident management unless those capabilities are implemented separately.

### 4. Model Score Is Not a Calibrated Probability

The model's score should not be interpreted as a calibrated probability that an attack is occurring.

A model may return class probabilities or scores, but these values are not necessarily calibrated to real-world attack likelihood. Calibration must be implemented and evaluated before making probability claims.

### 5. AI Explains the Classifier's Result; It Does Not Perform Detection

The Random Forest classifier performs the traffic classification. Gemini/Gemma generates a natural-language explanation based on the supplied result and evidence.

The language model does not independently verify that an intrusion has occurred. Its explanation may be incomplete or incorrect, so it must be interpreted alongside the classifier's output and supporting evidence.

### 6. Gemini/Gemma May Use a Fallback Explanation

If the configured AI service is unavailable, the application may use a fallback explanation instead of an AI-generated response.

A fallback explanation is an alternative response and should not be presented as though it were generated by the language model. The exact behavior depends on the application's implemented error-handling logic.

### 7. Dataset and Generalization Limitations

The model is trained using CIC-IDS2017, which may not represent every modern network environment or emerging attack technique. Class imbalance can also affect performance on rare attack categories.

Evaluation on additional datasets and authorized real-world traffic would be needed to better understand generalization.

##  Security and Responsible Use

- Treat predictions as indicators for investigation, not definitive proof of malicious activity.
- Validate incoming requests and feature values.
- Protect API keys, credentials, and sensitive network information.
- Avoid transmitting confidential network data to external AI services without appropriate authorization.
- Keep AI-generated explanations grounded in the evidence supplied to the model.
- Test for false positives and false negatives.
- Do not claim live monitoring, automatic blocking, or organization-wide history unless these features are implemented and verified.
- Require human review before taking consequential security actions.

## Future Improvements

Possible future improvements include:

- Live packet capture and network-flow collection.
- Continuous network monitoring.
- Integration with authorized firewall or security-response systems.
- Persistent and organization-wide event history.
- Authentication and role-based access control.
- Model calibration and more reliable score interpretation.
- Improved detection of rare attack classes.
- More detailed evaluation and model explainability.
- Centralized logging and audit trails.
- Automated tests and deployment workflows.
- Evaluation on additional datasets and authorized network traffic.

These are potential improvements, not claims about the current implementation.

##  Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the changes.
5. Submit a pull request with a description of the changes.

## 📄 License

Refer to the `LICENSE` file in this repository for the applicable license terms.

##  Project Summary

CyberSentinel AI combines a Random Forest network traffic classifier, backend processing, and Gemini/Gemma-based explanations to make intrusion analysis results easier to understand.

The project includes dataset preparation and machine-learning workflows alongside an application interface for presenting predictions and explanations.

Its current scope is a demonstration and analysis system. It does not provide live packet capture, automatic attack blocking, organization-wide history, or calibrated attack probabilities.

**Random Forest classifies the traffic. Gemini/Gemma explains the result. CyberSentinel AI brings the analysis together in one interface.**
