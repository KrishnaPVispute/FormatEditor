// Pre-extracted section data from 1937_LCP_David.pdf
// This data is used as default content for ALL templates - user can edit/delete

import { Section, SectionItem, FormattedText } from "@/components/SectionEditor";

const createTextItem = (content: string, fontSize: number = 11, isBold: boolean = false): SectionItem => ({
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
export const getDefaultSectionData = (): Section[] => [
  {
    id: crypto.randomUUID(),
    title: "Executive Summary",
    items: [
      createTextItem("1.1 Executive Summary", 14, true),
      createTextItem(`This Life Care Plan (this "Report") has been prepared for Mr. David Gupte, a 38-year-old male, who sustained a lumbar disc bulges and cervical disc herniations, as a result of a Motor Vehicle incident on February 23, 2023.

The total nominal value of Mr. Gupte's future medical requirements, as formulated in this Life Care Plan, and which pertains to his relevant diagnostic conditions and disabilities, is $793,321.72.`),
      createTextItem("1.2 Life Care Planning and Life Care Plans", 14, true),
      createTextItem(`Life care planning is a process of applying objective methodological analysis to formulate diagnostic conclusions and opinions regarding physical and/or mental impairment and disability for the purpose of determining care requirements for individuals with permanent or chronic medical conditions.

According to the tenets, methods, and best practices advocated by the American Academy of Physician Life Care Planners, a Life Care Planner's primary objective is to achieve the Clinical Objectives of Life Care Planning by answering the basic questions of Life Care Planning.`),
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Summary of Medical Records",
    items: [
      createTextItem("2.1 Summary of Medical Records", 14, true),
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
      ], "Sources Table"),
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Interview & History",
    items: [
      createTextItem("3.1 Recent History", 14, true),
      createTextItem("3.1.1 History of Present Injury/Illness", 12, true),
      createTextItem(`Mr. Gupte sustained injuries as a result of a motor vehicle collision that occurred on February 23, 2023. A large truck collided with his vehicle, and emergency medical services arrived at the scene.

Prior to this incident, Mr. Gupte had no history of injuries involving the cervical spine, lumbar spine, or upper extremities. Following the motor vehicle incident, he began experiencing persistent pain and dysfunction affecting multiple areas, most notably the cervical and lumbar spine, as well as his left upper extremity.

He reports ongoing pain in the neck and lower back, currently rated at 7 out of 10 and 6 out of 10, respectively. The nature of his pain is described as aching, shooting, and throbbing, and it is constant in duration.`),
      createTextItem("3.2 Subjective History", 14, true),
      createTextItem("3.2.1 Current Symptoms: Neck and lower back. Pain level: 7/10 for the neck, 6/10 for the lower back."),
      createTextItem("3.2.2 Physical Symptoms:", 12, true),
      createTextItem(`• Neck pain radiating into the left shoulder and arm.
• Lower back pain with radiation in both legs, left greater than right.
• Tingling and numbness in the left arm and hand.
• Muscle spasms in the cervical and lumbar regions.`),
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Review of Systems",
    items: [
      createTextItem("3.3 Review of Systems", 14, true),
      createTextItem("3.3.1 Emotional Symptoms:", 12, true),
      createTextItem(`• Cognitive difficulties, including impaired short-term memory.
• Mood fluctuations due to persistent pain and limited mobility.`),
      createTextItem("3.3.2 Neurologic:", 12, true),
      createTextItem(`• Numbness and tingling in both hands and feet.
• Left arm weakness (especially the triceps and tibialis anterior).
• Pain radiating from neck down to the left arm.
• Sciatic pain radiating from the lower back down the left leg.`),
      createTextItem("3.3.3 Orthopedic:", 12, true),
      createTextItem(`• Reduced range of motion in the cervical and lumbar spine.
• Tenderness over the occipital nerves and cervical trigger points.
• Paralumbar spasm and midline tenderness at L5-S1.
• Positive straight leg raises.`),
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Medical & Social History",
    items: [
      createTextItem("3.4 Past Medical History: Diabetes", 12, true),
      createTextItem("3.5 Past Surgical History: None noted.", 12, true),
      createTextItem("3.10 Medications:", 12, true),
      createTextItem(`• Methylprednisolone
• Tizanidine HCI
• Ibuprofen
• Over-the-counter pain relievers (Motrin, Aleve, or Tylenol).`),
      createTextItem("3.12 Social History", 12, true),
      createTextItem("3.13 Education History: High School Graduate"),
      createTextItem("3.14 Professional/Work History:", 12, true),
      createTextItem(`• Current Occupation: Supermarket Worker.
• Previous Occupation: Uber driver`),
      createTextItem("3.20 Residential Situation: City: Camden, State: New Jersey"),
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Central Opinions",
    items: [
      createTextItem("4.1 Diagnostic Conditions", 14, true),
      createTextItem(`For the purpose of Life Care Planning, a diagnostic condition can be defined as an impairment. The following represents my professional medical opinion regarding Mr. Gupte's diagnostic conditions:

• Diagnostic Condition 1: Cervical HNP associated with radiculopathy.
• Diagnostic Condition 2: Lumbar disc bulges.`),
      createTextItem("4.2 Consequent Circumstances", 14, true),
      createTextItem("4.2.1 Disabilities:", 12, true),
      createTextItem(`• Decreased ability for reaching/looking up.
• Decreased ability to lift or carry heavy objects.
• Decreased ability for fine motor tasks requiring arm elevation.
• Decreased ability to look down or up for extended periods.
• Decreased ability for prolonged standing or sitting.
• Decreased ability to bend, lift, or twist.
• Decreased ability to walk long distances.
• Decreased ability to perform activities requiring core stability.`),
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Duration of Care",
    items: [
      createTextItem("4.2.2 Probable Duration of Care", 14, true),
      createTextItem(`This formulation of Mr. Gupte's Probable Duration of Care has been prepared by me, Paul Ghattas, D.O., for the purpose of his Life Care Plan.

The methodology I have employed to formulate Mr. Gupte's Probable Duration of Care is that which is advocated by the American Academy of Physician Life Care Planners.`),
      createTextItem("8.1 Probable Duration of Care Metrics", 12, true),
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
  {
    id: crypto.randomUUID(),
    title: "Future Medical Requirements",
    items: [
      createTextItem("5. Future Medical Requirements", 14, true),
      createTextItem("5.1 Physician Services: See cost table"),
      createTextItem("5.2 Routine Diagnostics: See cost table"),
      createTextItem("5.3 Medications: See cost table"),
      createTextItem("5.4 Laboratory Studies: See cost table"),
      createTextItem("5.5 Rehabilitation Services: See cost table"),
      createTextItem("5.6 Equipment & Supplies: See cost table"),
      createTextItem("5.7 Environmental Modifications & Essential Services: See cost table"),
      createTextItem("5.8 Acute Care Services: See cost table"),
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Cost Projection Tables",
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
        ["6", "Pharmacology", "$369,148.80"],
        ["7", "Future Aggressive Care/Surgical Intervention", "$184,082.16"],
        ["8", "Home Care/Home Services", "$0.00"],
        ["9", "Labs", "$3,045.07"],
        ["", "Grand Total", "$793,321.72"],
      ], "Summary Cost Projection"),
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "Overview of Medical Expert",
    items: [
      createTextItem("10. Overview of Medical Expert", 14, true),
      createTextItem("Paul Ghattas, D.O.", 12, true),
      createTextItem(`Paul Ghattas is a Board-Certified Orthopedic Surgeon specializing in arthroscopic procedures of the shoulder, elbow, and knee. He has practiced medicine in Texas since 2016 and serves as the Director of Shoulder and Elbow Surgery at Star Orthopedics and Sports Medicine.

Ghattas earned his medical degree from Nova Southeastern University in Ft. Lauderdale, Florida. He completed his orthopedic surgery residency at the Wellmont/Lincoln Memorial University Orthopedic Residency Program in Tennessee.

Following his residency, he pursued subspecialty fellowship training at the prestigious WB Carrell Memorial Clinic in Dallas, Texas.

Ghattas is widely regarded as an expert in reconstructive and arthroscopic surgery of the upper extremity. His practice focuses on advanced techniques in shoulder and elbow surgery, including the Latarjet procedure, reverse total shoulder replacement, and minimally invasive approaches to shoulder reconstruction.`),
    ]
  }
];

// Alias for backward compatibility
export const getDavidTemplateSections = getDefaultSectionData;

// Empty sections for starting fresh
export const getEmptySections = (): Section[] => [
  { id: crypto.randomUUID(), title: "Executive Summary", items: [] },
  { id: crypto.randomUUID(), title: "Summary of Medical Records", items: [] },
  { id: crypto.randomUUID(), title: "Interview & History", items: [] },
  { id: crypto.randomUUID(), title: "Review of Systems", items: [] },
  { id: crypto.randomUUID(), title: "Medical & Social History", items: [] },
  { id: crypto.randomUUID(), title: "Central Opinions", items: [] },
  { id: crypto.randomUUID(), title: "Duration of Care", items: [] },
  { id: crypto.randomUUID(), title: "Future Medical Requirements", items: [] },
  { id: crypto.randomUUID(), title: "Cost Projection Tables", items: [] },
  { id: crypto.randomUUID(), title: "Overview of Medical Expert", items: [] },
];

// Legacy function - now returns the default data for any template type
export const getDefaultSections = (templateType: "LCA" | "LCP"): Section[] => {
  return getDefaultSectionData();
};
