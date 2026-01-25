// Pre-extracted section data from 1937_LCP_David.pdf
// This data is used as default content for ALL templates - user can edit/delete

import { Section, SectionItem, FormattedText } from "@/components/SectionEditor";

const createTextItem = (content: string, fontSize: number = 12, isBold: boolean = false): SectionItem => ({
  id: crypto.randomUUID(),
  type: "text",
  text: { content, fontSize, isBold, isItalic: false, isUnderline: false, alignment: 'left' }
});

const createTableItem = (rows: string[][], header?: string): SectionItem => ({
  id: crypto.randomUUID(),
  type: "table",
  tableData: { rows, header }
});

// This is the DEFAULT data used for all templates - extracted from 1937_LCP_David
// Section titles are now generic "Section 1, 2, 3..." - user can edit them
export const getDefaultSectionData = (): Section[] => [
  // Section 1: Overview (1.1 - 1.4)
  {
    id: crypto.randomUUID(),
    title: "Section 1",
    items: [
      createTextItem("1. Overview", 14, true),
      createTextItem("1.1 Executive Summary", 13, true),
      createTextItem(`This Life Care Plan (this "Report") has been prepared for Mr. David Gupte, a 38-year-old male, who sustained a lumbar disc bulges and cervical disc herniations, as a result of a Motor Vehicle incident on February 23, 2023.

The total nominal value of Mr. Gupte's future medical requirements, as formulated in this Life Care Plan, and which pertains to his relevant diagnostic conditions and disabilities, is $793,321.72.`),
      createTextItem("1.2 Life Care Planning and Life Care Plans", 13, true),
      createTextItem("1.2.1 Life Care Planning", 12, true),
      createTextItem(`Life care planning is a process of applying objective methodological analysis to formulate diagnostic conclusions and opinions regarding physical and/or mental impairment and disability for the purpose of determining care requirements for individuals with permanent or chronic medical conditions.

According to the tenets, methods, and best practices advocated by the American Academy of Physician Life Care Planners, a Life Care Planner's primary objective is to achieve the Clinical Objectives of Life Care Planning by answering the basic questions of Life Care Planning.`),
      createTextItem("Clinical Objectives of Life Care Planning:", 12, true),
      createTextItem(`• Diminish or eliminate physical and psychological pain and suffering.
• Reach and maintain the highest level of function given an individual's unique circumstances.
• Prevent complications to which an individual's unique physical and mental conditions predispose them.
• Afford the individual the best possible quality of life considering their condition.`),
      createTextItem("Basic Questions of Life Care Planning:", 12, true),
      createTextItem(`1. What is the individual's condition?
2. What medically related goods and services does an individual's condition require?
3. How much will the medically related goods and services cost over time?`),
      createTextItem("1.2.2 Life Care Plans", 12, true),
      createTextItem(`Life Care Plans are comprehensive documents that objectively identify the residual medical conditions and ongoing care requirements of ill/injured individuals. In addition, Life Care Plans quantify the costs of supplying these individuals with requisite, medically related goods and services throughout probable durations of care.

The content and structure of a Life Care Plan, and the methods used to produce it, are based on comprehensive assessments, interviews and/or examinations, research and analysis, published methodologies, and standards of practice.`),
      createTextItem("1.3 Biography of Medical Expert", 13, true),
      createTextItem(`Paul Ghattas is a Board-Certified Orthopedic Surgeon specializing in arthroscopic procedures of the shoulder, elbow, and knee. He has practiced medicine in Texas since 2016 and serves as the Director of Shoulder and Elbow Surgery at Star Orthopedics and Sports Medicine.

Ghattas earned his medical degree from Nova Southeastern University in Ft. Lauderdale, Florida. He completed his orthopedic surgery residency at the Wellmont/Lincoln Memorial University Orthopedic Residency Program in Tennessee. Following his residency, he pursued subspecialty fellowship training at the prestigious WB Carrell Memorial Clinic in Dallas, Texas.

Ghattas is widely regarded as an expert in reconstructive and arthroscopic surgery of the upper extremity. His practice focuses on advanced techniques in shoulder and elbow surgery, including the Latarjet procedure, reverse total shoulder replacement, and minimally invasive approaches to shoulder reconstruction.`),
      createTextItem("1.4 Framework: A Life Care Plan for Mr. David", 13, true),
      createTextItem(`It is my hope this Life Care Plan will serve as a guide for Mr. David and/or his family, case managers, and health care providers. This Life Care Plan has been formulated to provide optimal medical care to accomplish the Clinical Objectives of Life Care Planning.

This Life Care Plan employs an anticipatory (preventative) model of care, and its formulation relies upon reasonable degrees of medical probability.`),
    ]
  },
  // Section 2: Summary of Records (2.1 - 2.1.3)
  {
    id: crypto.randomUUID(),
    title: "Section 2",
    items: [
      createTextItem("2. Summary of Records", 14, true),
      createTextItem(`This Summary of Records ("Summary") is a chronological synopsis of Mr. David Gupte's medical records, and other relevant documents, presented first by facility, and then by treating physicians and/or other relevant medical personnel.`),
      createTextItem("2.1 Summary of Medical Records", 13, true),
      createTextItem("2.1.1 Sources", 12, true),
      createTextItem("This table contains a chronological list of the provided medical records reviewed for past medical treatments for injury-related conditions."),
      createTableItem([
        ["Date", "Type of Visit", "Facility Name", "Provider", "Specialty"],
        ["02/28/2023", "Initial Chiropractic Exam", "Princeton Brain & Spine", "Tom Ulrich, D.C.", "Chiropractic"],
        ["03/02/2023", "Multiple treatments", "Princeton Brain & Spine", "Tom Ulrich, D.C.", "Chiropractic"],
        ["03/14/2023", "Follow-up Evaluation", "Princeton Brain & Spine", "Samantha E Creamer, PA-C", "Physician Assistant"],
        ["04/25/2023", "MRI of Lumbar Spine", "Pennsauken Diagnostic Center", "Steven Brownstein, M.D.", "Radiology"],
        ["04/27/2023", "MRI of Cervical Spine", "Pennsauken Diagnostic Center", "Steven Brownstein, M.D.", "Radiology"],
        ["06/01/2023", "Neurological Evaluation", "Eastern Neurodiagnostic Associates, P.C.", "Kishor Patil, M.D.", "Neurology"],
        ["06/15/2023", "Psychology Evaluation", "N/A", "Robert Pasahow, Ph.D., P.A", "Psychology"],
        ["07/03/2023", "EMG/NCV", "Eastern Neurodiagnostic Associates, P.C.", "Matthew McClure, M.D.", "Neurology"],
        ["07/18/2023", "Follow-up Neurological Evaluation", "Eastern Neurodiagnostic Associates, P.C.", "Kishor Patil, M.D.", "Neurology"],
        ["07/31/2023", "Follow-up Neurological Evaluation", "Eastern Neurodiagnostic Associates, P.C.", "Kishor Patil, M.D.", "Neurology"],
      ], "Sources Table"),
      createTextItem("2.1.2 Chronological Synopsis of Medical Records", 12, true),
      createTextItem("A detailed, chronological summary of medical records received to highlight medical history, treatments, healthcare interventions, and any other key events relevant to current and future care needs."),
      createTextItem("2.1.3 Diagnostics", 12, true),
      createTextItem(`MRI of lumbar spine without contrast (04/25/2023):
• Annular bulging of the posterior annular fibers L5-S1 level
• Tilt of the lumbar column to the left, which may be due to muscular spasm and/or soft tissue injury
• Straightening of the normal cervical curve

MRI of cervical spine without contrast (04/27/2023):
• Central posterior protruded disc herniation at the C3-C4 level
• Diffuse bulging at C5-C6 disc
• Straightening of the normal cervical curve`),
    ]
  },
  // Section 3: Interview (3.1 - 3.22)
  {
    id: crypto.randomUUID(),
    title: "Section 3",
    items: [
      createTextItem("3. Interview", 14, true),
      createTextItem("I obtained the information presented here through my interview with Mr. David Gupte, which took place on April 11, 2025, along with a review of his medical records and other relevant documents to assess his diagnostic conditions and related circumstances."),
      createTextItem("3.1 Recent History", 13, true),
      createTextItem("3.1.1 History of Present Injury/Illness", 12, true),
      createTextItem(`Mr. Gupte sustained injuries as a result of a motor vehicle collision that occurred on February 23, 2023. A large truck collided with his vehicle, and emergency medical services arrived at the scene.

Prior to this incident, Mr. Gupte had no history of injuries involving the cervical spine, lumbar spine, or upper extremities. Following the motor vehicle incident, he began experiencing persistent pain and dysfunction affecting multiple areas, most notably the cervical and lumbar spine, as well as his left upper extremity.

He reports ongoing pain in the neck and lower back, currently rated at 7 out of 10 and 6 out of 10, respectively. The nature of his pain is described as aching, shooting, and throbbing, and it is constant in duration.`),
      createTextItem("3.2 Subjective History", 13, true),
      createTextItem("3.2.1 Current Symptoms", 12, true),
      createTextItem("Neck and lower back. Pain level: 7/10 for the neck, 6/10 for the lower back."),
      createTextItem("3.2.2 Physical Symptoms", 12, true),
      createTextItem(`• Neck pain radiating into the left shoulder and arm.
• Lower back pain with radiation in both legs, left greater than right.
• Tingling and numbness in the left arm and hand.
• Muscle spasms in the cervical and lumbar regions.`),
      createTextItem("3.2.3 Functional Symptoms", 12, true),
      createTextItem("Difficulty with prolonged sitting, standing, lifting, and carrying items heavier than 10 pounds, limiting David's ability to perform work and household tasks."),
      createTextItem("3.3 Review of Systems", 13, true),
      createTextItem("3.3.1 Emotional Symptoms", 12, true),
      createTextItem(`• Cognitive difficulties, including impaired short-term memory.
• Mood fluctuations due to persistent pain and limited mobility.`),
      createTextItem("3.3.2 Neurologic", 12, true),
      createTextItem(`• Numbness and tingling in both hands and feet.
• Left arm weakness (especially the triceps and tibialis anterior).
• Pain radiating from neck down to the left arm.
• Sciatic pain radiating from the lower back down the left leg.`),
      createTextItem("3.3.3 Orthopedic", 12, true),
      createTextItem(`• Reduced range of motion in the cervical and lumbar spine.
• Tenderness over the occipital nerves and cervical trigger points.
• Paralumbar spasm and midline tenderness at L5-S1.
• Positive straight leg raises.`),
      createTextItem("3.3.4 - 3.3.9 Other Systems", 12, true),
      createTextItem(`Cardiovascular: None
Integumentary: None
Respiratory: None
Digestive: None
Urinary: None
Circulation: None`),
      createTextItem("3.3.10 Behavioral", 12, true),
      createTextItem(`Occasional sleep disturbances due to pain.
Fatigue from managing ongoing pain and treatment.`),
      createTextItem("3.4 Past Medical History", 12, true),
      createTextItem("Diabetes"),
      createTextItem("3.5 Past Surgical History", 12, true),
      createTextItem("None noted."),
      createTextItem("3.6 - 3.9 Additional History", 12, true),
      createTextItem(`Injections: None
Family History: None
Allergies: None
Drug and Other Allergies: None`),
      createTextItem("3.10 Medications", 12, true),
      createTextItem(`• Methylprednisolone
• Tizanidine HCI
• Ibuprofen
• Over-the-counter pain relievers (Motrin, Aleve, or Tylenol).`),
      createTextItem("3.11 Assistive Device", 12, true),
      createTextItem("None"),
      createTextItem("3.12 Social History", 12, true),
      createTextItem("None"),
      createTextItem("3.13 Education History", 12, true),
      createTextItem("High School Graduate"),
      createTextItem("3.14 Professional/Work History", 12, true),
      createTextItem(`Current Occupation: Supermarket Worker.
Previous Occupation: Uber driver`),
      createTextItem("3.15 - 3.19 Lifestyle", 12, true),
      createTextItem(`Habits: Occasional use of over-the-counter medications for pain management
Tobacco use: Smoker
Alcohol use: None
Illicit drugs: None
Avocational Activities: Limited recreational activities due to pain, including walking and occasional light housework`),
      createTextItem("3.20 Residential Situation", 12, true),
      createTextItem("City: Camden, State: New Jersey"),
      createTextItem("3.21 Transportation", 12, true),
      createTextItem("Difficulty driving for extended periods due to neck and shoulder pain."),
      createTextItem("3.22 Household Responsibilities", 12, true),
      createTextItem("Limited ability to perform heavy lifting or long-duration standing, which impacts household chores such as cleaning, shopping, and lifting items."),
    ]
  },
  // Section 4: Central Opinions (4.1 - 4.2.6)
  {
    id: crypto.randomUUID(),
    title: "Section 4",
    items: [
      createTextItem("4. Central Opinions", 14, true),
      createTextItem("4.1 Diagnostic Conditions", 13, true),
      createTextItem(`For the purpose of Life Care Planning, a diagnostic condition can be defined as an impairment. The following represents my professional medical opinion regarding Mr. Gupte's diagnostic conditions:

• Diagnostic Condition 1: Cervical HNP associated with radiculopathy.
• Diagnostic Condition 2: Lumbar disc bulges.`),
      createTextItem("4.2 Consequent Circumstances", 13, true),
      createTextItem("4.2.1 Disabilities", 12, true),
      createTextItem(`According to the American Medical Association's Guides to the Evaluation of Permanent Impairment, 5th Edition, a disability is defined as "an alteration of an individual's capacity to meet personal, social, or occupational demands because of an impairment."

• Decreased ability for reaching/looking up.
• Decreased ability to lift or carry heavy objects.
• Decreased ability for fine motor tasks requiring arm elevation.
• Decreased ability to look down or up for extended periods.
• Decreased ability for prolonged standing or sitting.
• Decreased ability to bend, lift, or twist.
• Decreased ability to walk long distances.
• Decreased ability to perform activities requiring core stability.`),
      createTextItem("4.2.2 Probable Duration of Care", 12, true),
      createTextItem(`This formulation of Mr. Gupte's Probable Duration of Care has been prepared by me, Paul Ghattas, D.O., for the purpose of his Life Care Plan.

The methodology I have employed to formulate Mr. Gupte's Probable Duration of Care is that which is advocated by the American Academy of Physician Life Care Planners.`),
      createTextItem("4.2.3 Average Residual Years", 12, true),
      createTextItem("To establish Mr. Gupte's Average Residual Years, I have relied upon The National Vital Statistics Reports, United States Life Tables 2024. Mr. Gupte's Average Residual Years = 39.26."),
      createTextItem("4.2.4 Life Expectancy", 12, true),
      createTextItem(`Life Expectancy = Current Age + Average Residual Years
Mr. Gupte's Current Age = 38
Mr. Gupte's Average Residual Years = 39.26
Therefore, Mr. Gupte's Life Expectancy = 77.26`),
      createTextItem("4.2.5 Adjustments to Life Expectancy", 12, true),
      createTextItem("In consideration of the potential impact of various factors, it is my opinion that Mr. Gupte's Residual Years will not be impacted, therefore, I have made a 0% adjustment to Mr. Gupte's Average Residual Years."),
      createTextItem("4.2.6 Probable Duration of Care", 12, true),
      createTextItem("Mr. Gupte's Average Residual Years = 39.26, the Probable Duration of Care upon which his Life Care Plan is based."),
    ]
  },
  // Section 5: Future Medical Requirements (5.1 - 5.8)
  {
    id: crypto.randomUUID(),
    title: "Section 5",
    items: [
      createTextItem("5. Future Medical Requirements", 14, true),
      createTextItem("The future medical requirements specified herein are intended to address the diagnostic conditions and consequent circumstances specified in Mr. David Gupte's Life Care Plan."),
      createTextItem("5.1 Physician Services", 12, true),
      createTextItem("See cost table"),
      createTextItem("5.2 Routine Diagnostics", 12, true),
      createTextItem("See cost table"),
      createTextItem("5.3 Medications", 12, true),
      createTextItem("See cost table"),
      createTextItem("5.4 Laboratory Studies", 12, true),
      createTextItem("See cost table"),
      createTextItem("5.5 Rehabilitation Services", 12, true),
      createTextItem("See cost table"),
      createTextItem("5.6 Equipment & Supplies", 12, true),
      createTextItem("See cost table"),
      createTextItem("5.7 Environmental Modifications & Essential Services", 12, true),
      createTextItem("See cost table"),
      createTextItem("5.8 Acute Care Services", 12, true),
      createTextItem("See cost table"),
    ]
  },
  // Section 6: Cost/Vendor Survey (6.1 - 6.1.2)
  {
    id: crypto.randomUUID(),
    title: "Section 6",
    items: [
      createTextItem("6. Cost/Vendor Survey", 14, true),
      createTextItem(`The purpose of this Cost/Vendor Survey (the "Survey") is to enhance the transparency of the Life Care Plan's Cost Analysis. This Survey is presented in two sections:

1. Methods, Definitions and Discussion: Discloses the methods and parameters used to perform this Survey.
2. Cost Data Sample: Exhibits all unit costs and other source-specific information obtained during this Survey.`),
      createTextItem("6.1 Methods, Definitions, and Discussion", 13, true),
      createTextItem("6.1.1 Survey Methodology", 12, true),
      createTextItem(`1. Specified Vendors/Providers: When specific vendors/providers are specified, the costs associated with these specified vendors/providers are cited in this Life Care Plan's Vendor Survey.

2. Usual, Customary & Reasonable (UCR) Data: If no specific vendors/providers are specified, or if cost information cannot be obtained, UCR cost data is sourced.

3. Web and Telephone Inquiries: In the absence of preferred vendors/providers, cost data is sourced via web or telephone inquiries from vendors/providers within a 35-mile radius.

4. National Online Vendors: Cost data from national online vendors is included without consideration given to location.

5. Multiple Data Sources for Single Items: For items requiring multiple data sources, values for each cost component are obtained and summed.`),
      createTextItem("6.1.2 Definitions and Discussion", 12, true),
      createTextItem(`Probable Location of Care & Proximity:
Prices of medically related goods and services can vary based on geographic location. The geographic scope is defined as a 35-mile radius; and the probable location of care is defined using Geo-Zip locator: 08110.

Usual Customary & Reasonable (UCR) Cost Data:
UCR data in this Life Care Plan is sourced from Context4HealthCare, Inc. Context4 Healthcare is an independent, disinterested, third-party provider of medical cost data.`),
    ]
  },
  // Section 7: Definition & Discussion of Quantitative Methods (7.1 - 7.1.5)
  {
    id: crypto.randomUUID(),
    title: "Section 7",
    items: [
      createTextItem("7. Definition & Discussion of Quantitative Methods", 14, true),
      createTextItem("7.1 Nominal Value", 13, true),
      createTextItem(`This Analysis quantifies all costs in nominal value, or "today's dollars," without accounting for the time value of money, i.e., it does not account for inflation or discounts to formulate future and/or present values.`),
      createTextItem("7.1.2 Accounting Methods", 12, true),
      createTextItem("This Analysis uses Cash Method Accounting, in which values are accounted for within periods when cash outflows associated with the acquisition of future medical requirements are forecast to occur."),
      createTextItem("7.1.3 Variables", 12, true),
      createTextItem("7.1.3.1 Independent Variables", 12, true),
      createTextItem(`To quantify this life care plan's future medical requirements, this cost analysis considers the following independent variables:
• Start Date (Starting period)
• Quantity
• Interval
• Duration
• Unit Cost`),
      createTextItem("7.1.3.2 Dependent Variables", 12, true),
      createTextItem("From the preceding independent variables, the following dependent variable is derived: Frequency = (Quantity ÷ Interval)"),
      createTextItem("7.1.4 Unit Costs", 12, true),
      createTextItem("When Usual Customary & Reasonable (UCR) data is used, single-value unit costs, as specified in this Life Care Plan's Cost/Vendor Sample, are employed. When multiple prices are sourced from independent vendors/providers, unit costs are the arithmetic mean."),
      createTextItem("7.1.5 Counts & Conventions", 12, true),
      createTextItem("All quantities, intervals, and durations in this Cost Analysis are detailed under each future medical requirement heading. All time-related variables align with the Gregorian calendar."),
    ]
  },
  // Section 8: Probable Duration of Care Metrics (8.1)
  {
    id: crypto.randomUUID(),
    title: "Section 8",
    items: [
      createTextItem("8. Probable Duration of Care Metrics", 14, true),
      createTextItem("8.1 Probable Duration of Care Metrics", 13, true),
      createTableItem([
        ["Metric", "Value"],
        ["Name", "Mr. David Gupte"],
        ["Date of Birth (DOB)", "August 29, 1986"],
        ["Date of Injury (DOI)", "February 23, 2023"],
        ["Present Date", "April 21, 2025"],
        ["Current Age", "38"],
        ["Average Residual", "39.26 years"],
        ["Average Life Expectancy", "77.26 years"],
        ["Projected Duration of Care", "39.26 years"],
      ], "Duration Metrics"),
    ]
  },
  // Section 9: Summary Cost Projection Tables
  {
    id: crypto.randomUUID(),
    title: "Section 9",
    items: [
      createTextItem("9. Summary Cost Projection Tables", 14, true),
      createTextItem("The below medical cost projections were developed through methodologies defined above."),
      createTableItem([
        ["Table Number", "Table Title", "Total Cost Projection"],
        ["1", "Routine Medical Evaluations", "$65,320.79"],
        ["2", "Therapeutic Evaluations", "$11,727.74"],
        ["3", "Therapeutic Modalities", "$123,555.93"],
        ["4", "Diagnostic Testing", "$25,426.40"],
        ["5", "Equipment and Aids", "$11,014.83"],
        ["6", "Pharmacology", "$23,556.00"],
        ["7", "Future Aggressive Care/Surgical Intervention", "$380,331.15"],
        ["8", "Home Care/Home Services", "$142,278.24"],
        ["9", "Labs", "$10,110.64"],
        ["", "Total Cost Projection", "$793,321.72"],
      ], "Summary Cost Projection"),
    ]
  },
  // Section 10: Overview of Medical Expert
  {
    id: crypto.randomUUID(),
    title: "Section 10",
    items: [
      createTextItem("10. Overview of Medical Expert", 14, true),
      createTextItem("Paul Ghattas, D.O.", 13, true),
      createTextItem(`Paul Ghattas is a Board-Certified Orthopedic Surgeon specializing in arthroscopic procedures of the shoulder, elbow, and knee. He has practiced medicine in Texas since 2016 and serves as the Director of Shoulder and Elbow Surgery at Star Orthopedics and Sports Medicine.

Ghattas earned his medical degree from Nova Southeastern University in Ft. Lauderdale, Florida. He completed his orthopedic surgery residency at the Wellmont/Lincoln Memorial University Orthopedic Residency Program in Tennessee, where he trained at nationally recognized institutions, including Cincinnati Children's Hospital, the Hughston Clinic, and the University of South Florida.

Following his residency, he pursued subspecialty fellowship training at the prestigious WB Carrell Memorial Clinic in Dallas, Texas.

Ghattas is widely regarded as an expert in reconstructive and arthroscopic surgery of the upper extremity. His practice focuses on advanced techniques in shoulder and elbow surgery, including the Latarjet procedure, reverse total shoulder replacement, and minimally invasive approaches to shoulder reconstruction.

In addition to his clinical practice, Ghattas has contributed extensively to orthopedic research. He has authored multiple book chapters and scientific papers in peer-reviewed journals, including The American Journal of Orthopedics, Reconstructive Review, and the Orthopedic Journal of Sports Medicine.

Ghattas has been actively involved in sports medicine, serving as an ancillary sports medicine physician for the SMU Mustangs and the Dallas Mavericks. Throughout his career, he has received several prestigious awards and honors, including induction into the Sigma Phi National Honor Society and the Cecil B. Hall Academic Scholar Award.`),
    ]
  }
];

// Alias for backward compatibility
export const getDavidTemplateSections = getDefaultSectionData;

// Empty sections for starting fresh - now with generic names
export const getEmptySections = (): Section[] => [
  { id: crypto.randomUUID(), title: "Section 1", items: [] },
  { id: crypto.randomUUID(), title: "Section 2", items: [] },
  { id: crypto.randomUUID(), title: "Section 3", items: [] },
  { id: crypto.randomUUID(), title: "Section 4", items: [] },
  { id: crypto.randomUUID(), title: "Section 5", items: [] },
  { id: crypto.randomUUID(), title: "Section 6", items: [] },
  { id: crypto.randomUUID(), title: "Section 7", items: [] },
  { id: crypto.randomUUID(), title: "Section 8", items: [] },
  { id: crypto.randomUUID(), title: "Section 9", items: [] },
  { id: crypto.randomUUID(), title: "Section 10", items: [] },
];

// Legacy function - now returns the default data for any template type
export const getDefaultSections = (templateType: "LCA" | "LCP"): Section[] => {
  return getDefaultSectionData();
};
