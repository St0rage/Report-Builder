import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";
import moment from "moment";
import autoTable, { CellHookData } from "jspdf-autotable";
import sharp from "sharp";

type CoverData = {
  projectName: string;
  activityName: string;
  testCaseName: string;
  authorName: string;
  date: string;
};

type SectionData = {
  section: string;
  step: StepData[];
};

type StepData = {
  title: string;
  description: string;
  image: string;
  status: {
    name: string;
  };
};

type SummaryStatus = {
  totalPassed: number;
  totalFailed: number;
  totalDone: number;
};

type SummaryData = {
  title: string;
  linkNumber: string;
  status: string;
};

type ContentData = SummaryData & {
  description: string;
  image: string;
};

class ReportBuilder {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private x: number;
  private y: number;
  private xPadding: number;
  private yPadding: number;
  private page: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [210, 297],
    });

    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.x = 18;
    this.y = 18;
    this.xPadding = 6;
    this.yPadding = 6;
    this.page = 2;
  }

  private async addPage(totalPage: number) {
    const textFontSize = 10;
    const headerPosition = 8;
    const headerImagewidth = 24;
    const headerImageHeight = 7;
    const headerRightText = "Automation Test Execution Document";
    const footerPosition = 8;
    const footerLeftText = "Copyright © (2025) by BNI-APS. Testing Strategy Execution Form";
    const footerRightText = `Page ${this.page} of ${totalPage}`;

    // Add Page
    this.doc.addPage();
    this.doc.setTextColor("black");

    // Create Box
    this.doc.rect(
      this.x, // left margin
      this.y, // top margin
      this.pageWidth - this.x * 2, // width inside margins
      this.pageHeight - this.y * 2 // height inside margins
    );

    this.doc.setFontSize(textFontSize);

    // Set Header Left Image
    const rawImage = await fs.promises.readFile("./LogoBNI.png");
    const image = new Uint8Array(rawImage);
    this.doc.addImage(image, "PNG", this.x + this.xPadding, headerPosition, headerImagewidth, headerImageHeight);

    // Set Header Right Text
    const headerRightTextWidth = this.doc.getTextWidth(headerRightText);
    this.doc.setFont("times", "bold");
    this.doc.text(
      headerRightText,
      this.pageWidth - this.x - headerRightTextWidth - this.xPadding,
      headerPosition + 1.2 + headerImageHeight / 2
    );

    // Create Footer Information
    this.doc.setFont("times", "italic");
    // this.doc.setFontSize(textFontSize);
    const footerTextPosition: number = this.pageHeight - this.y + footerPosition;

    // Set Footer Left Text
    this.doc.text(footerLeftText, this.x + this.xPadding, footerTextPosition);

    // Set Footer Right Text
    const footerRightTextWidth: number = this.doc.getTextWidth(footerRightText);
    this.doc.text(footerRightText, this.pageWidth - this.x - this.xPadding - footerRightTextWidth, footerTextPosition);

    this.page += 1;
  }

  private async createCover(coverData: CoverData) {
    const coverX = 20;
    const coverY = 35;
    const projectNameFontSize = 26;
    const activityNameFontSize = 18;
    const testCaseNameFontSize = 12;
    const imageWidth = 35;
    const imageHeight = 10;
    const titleFontSize = 20;
    const title = "Automation Test Execution Document";
    const authorNameFontSize = 14;
    const authorName = `Prepared By ${coverData.authorName}`;
    const dateFontSize = 12;
    const copyRightFontSize = 11;
    const copyRightNotice = "COPYRIGHT NOTICE";
    const copyRight = "Copyright © (2025) by BNI-APS";
    const copyRightDetailFontSize = 8;
    const copyRightDetail =
      "All right reserved. This material is confidential and proprietary to BNI-STI and no part of this material should be reproduced, published in any form by any means, electronic or mechanical including photocopy or any information storage or retrieval system nor should the material be disclosed to third parties without the express written authorization of BNI-APS";

    const rawImage = await fs.promises.readFile("./LogoBNI.png");
    const image = new Uint8Array(rawImage);

    // Set Image
    this.doc.addImage(image, "PNG", this.pageWidth - coverX - imageWidth, coverY, imageWidth, imageHeight, "", "FAST");

    // Set Project Name
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(projectNameFontSize);
    const projectNameWidth = this.doc.getTextWidth(coverData.projectName);
    this.doc.text(coverData.projectName, this.pageWidth - coverX - projectNameWidth, this.pageHeight / 2.5);

    // Set Activity Name
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(activityNameFontSize);
    const activityNameWidth = this.doc.getTextWidth(coverData.activityName);
    this.doc.text(
      coverData.activityName,
      this.pageWidth - coverX - activityNameWidth,
      projectNameFontSize / 2.8 + this.pageHeight / 2.5
    );

    // Set Test Case Name
    this.doc.setFont("times", "italic");
    this.doc.setFontSize(testCaseNameFontSize);
    const testCaseNameWidth = this.doc.getTextWidth(coverData.testCaseName);
    this.doc.text(
      coverData.testCaseName,
      this.pageWidth - coverX - testCaseNameWidth,
      activityNameFontSize + this.pageHeight / 2.5
    );

    // Set Title
    const titleHeight = this.pageHeight - 95;
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(titleFontSize);
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, this.pageWidth - coverX - titleWidth, titleHeight);

    // Set Author
    this.doc.setFont("times", "italic");
    this.doc.setFontSize(authorNameFontSize);
    const authorNameWidth = this.doc.getTextWidth(authorName);
    this.doc.text(authorName, this.pageWidth - coverX - authorNameWidth, titleHeight + titleFontSize / 2.5);

    // Set Data
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(dateFontSize);
    const dateWidth = this.doc.getTextWidth(coverData.date);
    this.doc.text(coverData.date, this.pageWidth - coverX - dateWidth, titleHeight + authorNameFontSize + 1);

    // Set Footer Copy Right Detail
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(copyRightDetailFontSize);
    this.doc.setTextColor(125, 125, 125);
    let newCpRightDetail = "";
    const cpRightDtlLines = this.doc.splitTextToSize(copyRightDetail, this.pageWidth - coverX * 2) as string[];
    const cpRightDtlHeigth: number = (copyRightDetailFontSize / 3) * cpRightDtlLines.length;

    for (let i = 0; i < cpRightDtlLines.length; i++) {
      newCpRightDetail += `${cpRightDtlLines[i]}${i !== cpRightDtlLines.length - 1 ? "\n" : ""}`;
    }

    this.doc.text(newCpRightDetail, coverX, this.pageHeight - coverY + cpRightDtlHeigth);

    // Set Footer Copy Right
    const copyRightHeight = this.pageHeight - coverY - cpRightDtlHeigth + 10;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(copyRightFontSize);
    this.doc.text(copyRight, coverX, copyRightHeight);

    // Set Footer Copy Right Notice
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(copyRightFontSize);
    this.doc.text(copyRightNotice, coverX, copyRightHeight - 6);

    // this.doc.rect(this.x, 0, 0, this.pageHeight);
    // this.doc.rect(this.pageWidth - this.x, 0, 0, this.pageHeight);
    // this.doc.rect(0, coverY, this.pageWidth, 0);
    // this.doc.rect(0, this.pageHeight - 20, this.pageWidth, 0);
  }

  private async createBeritaAcaraPage1(page: number) {
    const fontSize = 11;
    const title = "Berita Acara System Integration Test (SIT)";

    // Set Page
    this.doc.setPage(page);

    // Set Title
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(fontSize);
    this.doc.text(title, this.x + this.xPadding, this.y + this.yPadding + fontSize / 2.5);

    // Set Main Information Table
    autoTable(this.doc, {
      head: [],
      body: [
        ["Changes ID", "[Diisi dengan Nomor Proyek/CR/IC/AI/SC/IR/SR]"],
        ["Changes Name", "[Diisi dengan nama Changes]"],
        ["Data of Request", "[Diisi dengan tanggal diterbitkan]"],
        ["IT Project Manager", "[Diisi dengan nama PIC IT PM]"],
        ["Team Lead Tester", "[Diisi dengan nama Team Lead Tester]"],
        [
          "Attachments",
          "[Diisi Test Script SIT, Laporan SIT, termasuk daftar hadir dan screen capture hardcopy/soft copy]",
        ],
        [
          {
            content: "Description",
            colSpan: 2,
          },
        ],
        [
          {
            content:
              "Pihak-pihak yang bertandatangan di bawah ini menyatakan bahwa telah dilaksanakan System Integration Test (SIT), untuk [App ID - nama Aplikasi] - deskripsi singkat pengembangan dengan ruang lingkup testing/scenario yang tercantum dalam final test script SIT dengan hasil tercantum pada Laporan SIT.\n\nSeluruh test script yang disepakati bersama untuk dijalankan dalam SIT termasuk Impacted feature yang di informasikan oleh pihak pengembangan telah berstatus tested good.",
            colSpan: 2,
          },
        ],
        [
          {
            content: "Accepted By",
            colSpan: 2,
          },
        ],
      ],
      startY: this.y + this.yPadding + fontSize / 1.5,
      theme: "grid",
      margin: {
        left: this.x + this.xPadding,
        right: this.x + this.xPadding,
      },
      styles: {
        fontSize: fontSize,
        font: "times",
        fontStyle: "normal",
        cellPadding: {
          bottom: 1,
          top: 1,
          left: 2,
        },
        lineColor: "black",
        textColor: "black",
      },
      columnStyles: {
        0: { cellWidth: 38 },
      },
      didParseCell: (data) => {
        const skipRows = [7, 9, 10];

        if (data.column.index === 0 && !skipRows.includes(data.row.index)) {
          data.cell.styles.fontStyle = "bold";
        }

        if (data.row.index === 8) {
          data.cell.styles.lineWidth = { bottom: 0, left: 0.2, right: 0.2, top: 0.2 };
        }
      },
    });

    // Set Signature Table
    autoTable(this.doc, {
      head: [],
      body: [
        [
          "Business Unit\n\n\n\n\n\n[Nama Pegawai]\n---------------------------------------------------\nDept. Head [Nama Departemen Business Unit]\nDivisi [Nama Divisi Business Unit]\nPT. Bank Negara Indonesia (Persero) Tbk.",
          "IT Application Service\n\n\n\n\n\n[Nama Pegawai]\n---------------------------------------------------\nDept. Head IT Testing & Source Control\nDivisi IT Application Service\nPT. Bank Negara Indonesia (Persero) Tbk.",
        ],
        [
          {
            content:
              "IT Project Manager\n\n\n\n\n\n[Nama Pegawai]\n---------------------------------------------------\nDept. Head IT Strategi Partner\nDivisi IT Strategy & Architecture\nPT. Bank Negara Indonesia (Persero) Tbk.",
            colSpan: 2,
          },
        ],
      ],
      startY: this.y + this.yPadding + 96,
      theme: "grid",
      margin: {
        left: this.x + this.xPadding,
        right: this.x + this.xPadding,
      },
      styles: {
        fontSize: fontSize,
        font: "times",
        fontStyle: "normal",
        cellPadding: {
          bottom: 1,
          top: 1,
          left: 2,
        },
        lineColor: "black",
        textColor: "black",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
      },
    });
  }

  private async createBeritaAcaraPage2(page: number) {
    const fontSize = 11;

    // Add Page
    this.doc.setPage(page);

    // Set Title
    const title =
      "Berita Acara System Integration Test (SIT) The information in this document has been fully reviewed and agreed by the following representatives of each party, continue to the next step.";
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(fontSize);
    const [newtitle, titleHeight] = await this.wrapText(title, fontSize);
    this.doc.text(newtitle, this.x + this.xPadding, this.y + this.yPadding + fontSize / 2.5);

    // Set Signature Table
    const usableWidth = this.pageWidth - (this.x + this.xPadding) * 2;
    autoTable(this.doc, {
      head: [],
      body: [
        ["Manual Tester / Automation Tester", "Test Manager", "Testing Team Leader"],
        [
          "\n\n\n\n\n\n_________________________",
          "\n\n\n\n\n\n_________________________",
          "\n\n\n\n\n\n_________________________",
        ],
        [
          "\n\n\n\n\n\n_________________________",
          "\n\n\n\n\n\n_________________________",
          "\n\n\n\n\n\n_________________________",
        ],
        ["Developer", "Source Control", "IT Project Manager"],
        [
          "\n\n\n\n\n\n_________________________",
          "\n\n\n\n\n\n_________________________",
          "\n\n\n\n\n\n_________________________",
        ],
      ],
      startY: this.y + this.yPadding + titleHeight + 4,
      theme: "grid",
      margin: {
        left: this.x + this.xPadding,
        right: this.x + this.xPadding,
      },
      styles: {
        fontSize: fontSize,
        font: "times",
        fontStyle: "normal",
        lineColor: "black",
        textColor: "black",
      },
      columnStyles: {
        0: { cellWidth: usableWidth / 3 },
        1: { cellWidth: usableWidth / 3 },
        2: { cellWidth: usableWidth / 3 },
      },
      didParseCell: (data) => {
        if (data.row.index === 1) {
          data.cell.styles.lineWidth = { bottom: 0, top: 0.2, left: 0.2, right: 0.2 };
        }
        if (data.row.index === 2) {
          data.cell.styles.lineWidth = { bottom: 0.2, top: 0, left: 0.2, right: 0.2 };
        }

        const headerIndex = [0, 3];
        const bodyIndex = [1, 2, 4];

        if (bodyIndex.includes(data.row.index)) {
          data.cell.styles.halign = "center";
        }

        if (headerIndex.includes(data.row.index)) {
          data.cell.styles.fillColor = "gray";
          data.cell.styles.textColor = "white";
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    const titlePadding = 11;
    const descPadding = 5.5;
    let titleNames = ["Short Description", "Business/System Requirement", "System Impacted", "System Change"];
    let currentTitlePosition = 0;
    let desc = "";
    let currentDescPosition = 0;
    let newDesc = "";
    let descHeight = 0;

    this.doc.setFontSize(fontSize);
    for (let i = 0; i < titleNames.length; i++) {
      if (i == 0) {
        currentTitlePosition = this.y + this.yPadding + 145;
      } else {
        currentTitlePosition += descHeight + titlePadding;
      }

      // Set Title
      this.doc.setFont("times", "bold");
      this.doc.text(titleNames[i], this.x + this.xPadding, currentTitlePosition);

      // Set Description (Max 381)
      if (i % 2 != 0) {
        desc = "<N/A>";
      } else {
        desc =
          "Pengetesan Fungsional Aplikasi Web, Pengetesan Fungsional Aplikasi Web, Pengetesan Fungsional Aplikasi Web, Pengetesan Fungsional Aplikasi Web, Pengetesan Fungsional Aplikasi Web, Pengetesan Fungsional Aplikasi Web, Pengetesan Fungsional Aplikasi Web, Pengetesan Fungsional Aplikasi Web, Pengetesan Fungsional Aplikasi Web, Pengetesan Fungsional Aplikasi Web, Pengetesan Fungsional";
      }
      currentDescPosition = currentTitlePosition + descPadding;
      this.doc.setFont("times", "normal");
      [newDesc, descHeight] = await this.wrapText(desc, fontSize);
      this.doc.text(newDesc, this.x + this.xPadding, currentDescPosition);
    }
  }

  private async createBeritaAcaraPage3(page: number) {
    const titleFontSize: number = 14;
    const fontSize = 11;
    const usableTableWidth = this.pageWidth - (this.x + this.xPadding) * 2;
    const subTitlePadding = 7;
    const tablePadding = 4;
    let title = "";
    let titleWidth = 0;
    let titlePosition = 0;
    let subTitle = "";
    let subtitleWidth = 0;
    let subTitlePosition = 0;
    let lastTableHeight = 0;

    // Add Page
    this.doc.setPage(page);

    // Set Testing Schedule
    title = "Testing Schedule";
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    titleWidth = this.doc.getTextWidth(title);
    titlePosition = this.y + this.yPadding + fontSize / 2;
    this.doc.text(title, this.pageWidth / 2 - titleWidth / 2, titlePosition);

    subTitle = "[Testing schedule based on approved Project Charter document]";
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(fontSize);
    subtitleWidth = this.doc.getTextWidth(subTitle);
    subTitlePosition = titlePosition + subTitlePadding;
    this.doc.text(subTitle, this.pageWidth / 2 - subtitleWidth / 2, subTitlePosition);

    autoTable(this.doc, {
      head: [],
      body: [
        ["Activity", "Milestone", "Target Date", "PIC"],
        [
          "<Test Activity, if using vendor's methodology, use their term>",
          "<Deliverable list from the activity to be received by BNI>",
          "<The target date of submission>",
          "<Name of the PIC responsible for the deliverable>",
        ],
      ],
      startY: subTitlePosition + tablePadding,
      theme: "grid",
      margin: {
        left: this.x + this.xPadding,
        right: this.x + this.xPadding,
      },
      styles: {
        fontSize: fontSize,
        font: "times",
        fontStyle: "normal",
        lineColor: "black",
        textColor: "black",
      },
      columnStyles: {
        0: { cellWidth: usableTableWidth / 4 },
        1: { cellWidth: usableTableWidth / 4 },
        2: { cellWidth: usableTableWidth / 4 },
        3: { cellWidth: usableTableWidth / 4 },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = "gray";
          data.cell.styles.textColor = "white";
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.halign = "center";
        }
      },
      didDrawPage: (data) => {
        lastTableHeight = data.cursor?.y as number;
      },
    });

    // Set Risk & Mitigation Plans
    title = "Risk & Mitigation Plans";
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    titleWidth = this.doc.getTextWidth(title);
    titlePosition = lastTableHeight + fontSize;
    this.doc.text(title, this.pageWidth / 2 - titleWidth / 2, titlePosition);

    subTitle = "[Define risks for testing and mitigation plan for all risks defined]";
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(fontSize);
    subtitleWidth = this.doc.getTextWidth(subTitle);
    subTitlePosition = titlePosition + subTitlePadding;
    this.doc.text(subTitle, this.pageWidth / 2 - subtitleWidth / 2, subTitlePosition);

    autoTable(this.doc, {
      head: [],
      body: [
        ["Test Phase", "Risk", "Mitigation", "PIC"],
        [
          "<Test Phase, where the identified risk will likely to occur>",
          "<The identified risk>",
          "<Detail the resolution of the issues here, agree with the related parties and stakeholders>",
          "<Name of the PIC responsible>",
        ],
      ],
      startY: subTitlePosition + tablePadding,
      theme: "grid",
      margin: {
        left: this.x + this.xPadding,
        right: this.x + this.xPadding,
      },
      styles: {
        fontSize: fontSize,
        font: "times",
        fontStyle: "normal",
        lineColor: "black",
        textColor: "black",
      },
      columnStyles: {
        0: { cellWidth: usableTableWidth / 4 },
        1: { cellWidth: usableTableWidth / 4 },
        2: { cellWidth: usableTableWidth / 4 },
        3: { cellWidth: usableTableWidth / 4 },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = "gray";
          data.cell.styles.textColor = "white";
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.halign = "center";
        }
      },
      didDrawPage: (data) => {
        lastTableHeight = data.cursor?.y as number;
      },
    });

    // Set Testing Scenario
    title = "Testing Scenario";
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    titleWidth = this.doc.getTextWidth(title);
    titlePosition = lastTableHeight + fontSize;
    this.doc.text(title, this.pageWidth / 2 - titleWidth / 2, titlePosition);

    subTitle = "[Describe the scenario for all phases]";
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(fontSize);
    subtitleWidth = this.doc.getTextWidth(subTitle);
    subTitlePosition = titlePosition + subTitlePadding;
    this.doc.text(subTitle, this.pageWidth / 2 - subtitleWidth / 2, subTitlePosition);

    autoTable(this.doc, {
      head: [],
      body: [
        ["Key", "Value"],
        ["Test Case ID", "SB_TAPCASH_V2_001"],
        ["Scenario", "Top Up"],
        ["Test Case", "Normal Top Up"],
        ["Expected Result", "Success Top Up"],
        ["Criteria", "Normal"],
      ],
      startY: subTitlePosition + tablePadding,
      theme: "grid",
      margin: {
        left: this.x + this.xPadding,
        right: this.x + this.xPadding,
      },
      styles: {
        fontSize: fontSize,
        font: "times",
        fontStyle: "normal",
        lineColor: "black",
        textColor: "black",
      },
      columnStyles: {
        0: { cellWidth: 35 },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = "gray";
          data.cell.styles.textColor = "white";
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.halign = "center";
        }

        if (data.row.index !== 0 && data.column.index !== 1) {
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: (data) => {
        lastTableHeight = data.cursor?.y as number;
      },
    });

    // Set Document Attributes
    title = "Document Attributes";
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    titleWidth = this.doc.getTextWidth(title);
    titlePosition = lastTableHeight + fontSize;
    this.doc.text(title, this.pageWidth / 2 - titleWidth / 2, titlePosition);

    autoTable(this.doc, {
      head: [],
      body: [
        ["Key", "Value"],
        ["Automation Tools", "Katalon Studio"],
        ["Apps", "BNI Direct"],
        ["Platform", "Rest API"],
      ],
      startY: titlePosition + subTitlePadding,
      theme: "grid",
      margin: {
        left: this.x + this.xPadding,
        right: this.x + this.xPadding,
      },
      styles: {
        fontSize: fontSize,
        font: "times",
        fontStyle: "normal",
        lineColor: "black",
        textColor: "black",
      },
      columnStyles: {
        0: { cellWidth: 35 },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = "gray";
          data.cell.styles.textColor = "white";
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.halign = "center";
        }

        if (data.row.index !== 0 && data.column.index !== 1) {
          data.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: (data) => {
        lastTableHeight = data.cursor?.y as number;
      },
    });
  }

  private async createBeritaAcaraPage4(page: number) {
    const titleFontSize: number = 14;
    const fontSize = 11;
    const subTitlePadding = 7;
    const tablePadding = 1.5;
    let title = "";
    let titleWidth = 0;
    let titlePosition = 0;
    let subTitle = "";
    let subTitlePosition = 0;

    // Add Page
    this.doc.setPage(page);

    // Set Testing Schedule
    title = "Test Execution Plan";
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    titleWidth = this.doc.getTextWidth(title);
    titlePosition = this.y + this.yPadding + fontSize / 2;
    this.doc.text(title, this.pageWidth / 2 - titleWidth / 2, titlePosition);

    subTitle =
      "[Functional Testing, Regression Testing, Integration Testing, Compatibility Testing, Load Testing, Performance Testing, Regression Testing, etc]";
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(fontSize);
    subTitlePosition = titlePosition + subTitlePadding;
    const [newSubtitle, newSubtitleHeight] = await this.wrapText(subTitle, fontSize);
    this.doc.text(newSubtitle, this.x + this.xPadding, subTitlePosition);

    autoTable(this.doc, {
      head: [],
      body: [
        ["Test Type", "Description"],
        [
          "Regression Test",
          "Testing with the intent of determining if bug fixes have been successful and have not created any new problems. Also, this type of testing is done to ensure that no degradation of baseline functionality has occurred",
        ],
        [
          "Unit Test",
          "Unit tests ensure that each unique path of the project performs accurately to the documented specifications and contains clearly defined inputs and expected results",
        ],
        [
          "System Test",
          "System testing ensures that the entire integrated software system meets requirements. It tests a configuration to ensure known and predictable results. System testing is based on process descriptions and flows, emphasizing predriven process links and integration points",
        ],
        [
          "Integration Test",
          "Testing two or more modules or functions together with the intent of finding interface defects between the modules or functions",
        ],
        [
          "Functional Test",
          "Functional test can be defined as testing two or more modules together with the intent of finding defects, demonstrating that defects are not present, verifying that the module performs its intended functions as stated in the specification and establishing confidence that a program does what it is supposed to do",
        ],
        [
          "Performance Test",
          "Testing with the intent of determining how quickly a product handles a variety of events. Automated test tools geared specifically to test and fine-tune performance are used most often for this type of testing",
        ],
        [
          "Compatibility Test",
          "Testing used to determine whether other system software components such as browsers, utilities, and competing software will conflict with the software being tested.",
        ],
        [
          "Load Test",
          "Testing with the intent of determining how well the product handles competition for system resources. The competition may come in the form of network traffic, CPU utilization or memory allocation",
        ],
        [
          "Stress Test",
          "Testing with the intent of determining how well a product performs when a load is placed on the system resources that nears and then exceeds capacity",
        ],
      ],
      startY: subTitlePosition + newSubtitleHeight + tablePadding,
      theme: "grid",
      margin: {
        left: this.x + this.xPadding,
        right: this.x + this.xPadding,
      },
      styles: {
        fontSize: fontSize,
        font: "times",
        fontStyle: "normal",
        lineColor: "black",
        textColor: "black",
      },
      columnStyles: {
        0: { cellWidth: 35 },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = "gray";
          data.cell.styles.textColor = "white";
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.halign = "center";
        }

        if (data.row.index !== 0 && data.column.index === 0) {
          data.cell.styles.halign = "center";
          data.cell.styles.valign = "middle";
        }

        if (data.row.index === 1) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
  }

  private async createTableOfContent(
    summaryData: SummaryData[],
    startPage: number,
    docSummaryStartPage: number,
    firstPageLength: number,
    restPageLength: number
  ) {
    const title = "Table of Content";
    const titleFontSize = 14;
    const fontSize = 11;
    const contentPadding: number = 5;
    const paddingTop: number = 3;
    const firstPagePaddingTopContent: number = this.y + titleFontSize + paddingTop + contentPadding;
    let tempContent: string;
    let currentPage = startPage;

    const convertContentToDotted = (title: string, page: string) => {
      const titleWidth = this.doc.getTextWidth(title);
      const pageNumberWidth = this.doc.getTextWidth(page);
      const availableWidth = this.pageWidth - titleWidth - pageNumberWidth - (this.x + this.xPadding) * 2;
      const dotWidth = this.doc.getTextWidth(".");
      const numberOfDots = Math.floor(availableWidth / dotWidth);

      const dots = ".".repeat(numberOfDots);

      return `${title}${dots}${page}`;
    };

    const setNewPage = () => {
      currentPageLength += restPageLength;
      this.doc.setPage(currentPage);
      this.doc.setFontSize(fontSize);
      currentContentPadding = this.y + fontSize / 2;
      currentPage += 1;
    };

    // Add Page
    this.doc.setPage(currentPage);

    // Set Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    const titleWidth = this.doc.getTextWidth(title);
    const titlePosition = this.y + this.yPadding + fontSize / 2;
    this.doc.text(title, this.pageWidth / 2 - titleWidth / 2, titlePosition);

    // Set Content FontSize
    this.doc.setFontSize(fontSize);

    // Set Berita Acara
    this.doc.setFont("times", "bold");
    tempContent = convertContentToDotted("Berita Acara", "2");
    this.doc.textWithLink(tempContent, this.x + this.xPadding, firstPagePaddingTopContent, {
      pageNumber: 2,
    });

    // Set Table of Content
    this.doc.setFont("times", "bold");
    tempContent = convertContentToDotted("Table of Content", "6");
    let currentContentPadding = firstPagePaddingTopContent + fontSize / 2.3;
    this.doc.textWithLink(tempContent, this.x + this.xPadding, currentContentPadding, {
      pageNumber: currentPage,
    });

    // Set Document Summary
    this.doc.setFont("times", "bold");
    tempContent = convertContentToDotted("Document Summary", docSummaryStartPage.toString());
    currentContentPadding += fontSize / 2.3;
    this.doc.textWithLink(tempContent, this.x + this.xPadding, currentContentPadding, {
      pageNumber: docSummaryStartPage,
    });

    // Set Rest Content
    currentPage += 1;
    let currentDataIndex = 0;
    let currentPageLength = firstPageLength;
    summaryData.forEach((val, idx) => {
      if (currentDataIndex === currentPageLength) setNewPage();

      if (val.status === "-") {
        this.doc.setFont("times", "bold");
        tempContent = convertContentToDotted(val.title, val.linkNumber);
      } else {
        this.doc.setFont("times", "normal");
        tempContent = convertContentToDotted(`   ${val.title}`, val.linkNumber);
      }

      currentContentPadding += fontSize / 2.3;
      this.doc.textWithLink(tempContent, this.x + this.xPadding, currentContentPadding, {
        pageNumber: Number(val.linkNumber),
      });
      currentDataIndex += 1;
    });
  }

  private async createDocumentSummary(
    summaryData: SummaryData[],
    startPage: number,
    firstPageLength: number,
    restPageLength: number,
    summaryStatus: SummaryStatus
  ) {
    const title = "Document Summary";
    const titleFontSize = 14;
    const fontSize = 11;
    const usableTableWidth = this.pageWidth - (this.x + this.xPadding) * 2;
    let lastTableHeight = 0;
    let currentPage = startPage;

    // Set Page
    this.doc.setPage(currentPage);

    // Set Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    const titleWidth = this.doc.getTextWidth(title);
    const titlePosition = this.y + this.yPadding + fontSize / 2;
    this.doc.text(title, this.pageWidth / 2 - titleWidth / 2, titlePosition);

    // Set Summary Total
    autoTable(this.doc, {
      head: [],
      body: [
        ["Total Passed", "Total Failed", "Total Done", "Total"],
        [
          summaryStatus.totalPassed,
          summaryStatus.totalFailed,
          summaryStatus.totalDone,
          summaryStatus.totalPassed + summaryStatus.totalFailed + summaryStatus.totalDone,
        ],
      ],
      theme: "grid",
      startY: this.y + titleFontSize + 8,
      margin: {
        left: this.x + this.xPadding,
        right: this.x + this.xPadding,
      },
      styles: {
        fontSize: fontSize,
        font: "times",
        fontStyle: "bold",
        cellPadding: {
          bottom: 0.8,
          top: 0.8,
        },
        lineColor: "black",
        textColor: "black",
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: usableTableWidth / 4 },
        1: { cellWidth: usableTableWidth / 4 },
        2: { cellWidth: usableTableWidth / 4 },
        3: { cellWidth: usableTableWidth / 4 },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = "gray";
          data.cell.styles.textColor = "white";
        }
        if (data.row.index === 1 && data.column.index === 0) {
          data.cell.styles.textColor = "green";
        }
        if (data.row.index === 1 && data.column.index === 1) {
          data.cell.styles.textColor = [247, 59, 59];
        }
      },
      didDrawPage: (data) => {
        lastTableHeight = data.cursor?.y as number;
      },
    });

    // Set Summary Content
    let summaryContent: SummaryData[][] = [];

    if (summaryData.length <= firstPageLength) {
      summaryContent.push(summaryData.slice(0, summaryData.length));
      summaryContent[0].unshift({ title: "Step Name", linkNumber: "Page", status: "Status" });
    }

    if (summaryData.length > firstPageLength) {
      summaryContent.push(summaryData.slice(0, firstPageLength));
      summaryContent[0].unshift({ title: "Step Name", linkNumber: "Page", status: "Status" });
      let summaryDataLeft = summaryData.length - firstPageLength;
      let startIndex = firstPageLength;
      for (let i = 1; i <= Math.ceil((summaryData.length - firstPageLength) / restPageLength); i++) {
        if (summaryDataLeft > restPageLength) {
          summaryContent.push(summaryData.slice(startIndex, startIndex + restPageLength));
          summaryDataLeft -= restPageLength;
          startIndex += restPageLength;
        } else {
          summaryContent.push(summaryData.slice(startIndex, summaryData.length));
        }
      }
    }

    const statusColumnStyling = (data: CellHookData) => {
      data.cell.styles.fontStyle = "bold";
      data.cell.styles.halign = "center";
      data.cell.styles.cellPadding = { left: 0, bottom: 0.8, top: 0.8 };
      if (data.cell.text[0] === "PASSED") {
        data.cell.styles.textColor = "green";
      } else if (data.cell.text[0] === "FAILED") {
        data.cell.styles.textColor = [247, 59, 59];
      }
      data.cell.text[0] = data.cell.text[0].charAt(0).toUpperCase() + data.cell.text[0].slice(1).toLowerCase();
    };

    const pageColumnStyling = (data: CellHookData) => {
      data.cell.styles.halign = "center";
      data.cell.styles.cellPadding = { left: 0, bottom: 0.8, top: 0.8 };
    };

    const sectionRowStyle = (data: CellHookData) => {
      const row = data.row.raw as SummaryData;

      if (row.status === "-") {
        data.cell.styles.fontStyle = "bold";
      }
    };

    for (let i = 0; i < summaryContent.length; i++) {
      this.doc.setPage(currentPage);
      autoTable(this.doc, {
        head: [],
        body: summaryContent[i],
        theme: "grid",
        startY: i === 0 ? lastTableHeight + 6 : this.y + this.yPadding + 2,
        margin: {
          left: this.x + this.xPadding,
          right: this.x + this.xPadding,
        },
        styles: {
          fontSize: fontSize,
          font: "times",
          fontStyle: "normal",
          textColor: "black",
          lineColor: "black",
          cellPadding: {
            bottom: 0.8,
            top: 0.8,
            left: 2,
          },
        },
        columnStyles: {
          1: { cellWidth: 12 },
          2: { cellWidth: 16 },
        },
        didParseCell: (data) => {
          if (data.row.index === 0 && i == 0) {
            data.cell.styles.fillColor = "gray";
            data.cell.styles.textColor = "white";
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.halign = "center";
            data.cell.styles.cellPadding = { left: 0, bottom: 0.5, top: 0.5 };
          }

          if (data.row.index !== 0 && data.column.index === 2 && i === 0) {
            statusColumnStyling(data);
          }

          if (data.column.index === 2 && i !== 0) {
            statusColumnStyling(data);
          }

          if (data.row.index !== 0 && i === 0) {
            sectionRowStyle(data);
          }

          if (i !== 0) {
            sectionRowStyle(data);
          }

          if (data.row.index !== 0 && data.column.index === 1 && i === 0) {
            pageColumnStyling(data);
          }

          if (data.column.index === 1 && i !== 0) {
            pageColumnStyling(data);
          }
        },
        didDrawCell: (data) => {
          if (data.row.index !== 0 && data.column.index == 0 && i == 0) {
            const rowData = data.row.raw as SummaryData;

            this.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
              pageNumber: Number(rowData.linkNumber),
            });
          }
          if (data.column.index === 0 && i !== 0) {
            const rowData = data.row.raw as SummaryData;

            this.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
              pageNumber: Number(rowData.linkNumber),
            });
          }
        },
      });
      currentPage++;
    }
  }

  private async createContent(contentData: ContentData[]) {
    const sectionFontSize = 12;
    const fontSize = 11;
    const titlePadding = 2;
    const descPadding = 6;
    const imagePadding = 3;

    const getImageAndSize = async (
      imagePath: string
    ): Promise<{ image: Uint8Array; newImageWidth: number; newImageHeight: number }> => {
      const rawImage = await fs.promises.readFile(`${imagePath}`);
      const image = new Uint8Array(rawImage);
      const metadata = await sharp(image).metadata();
      const maxWidth = this.pageWidth - (this.x + this.xPadding + 16) * 2;

      let newImageHeight = (this.pageHeight - (this.y + this.yPadding + 16) * 2) / 2.4;
      let newImageWidth = ((metadata?.width as number) / (metadata?.height as number)) * newImageHeight;

      if (newImageWidth > maxWidth) {
        newImageWidth = maxWidth;
      }

      return { image, newImageWidth, newImageHeight };
    };

    const getDescriptionTotalHeight = (description: string): [string, number] => {
      let lineHeight: number = 0;

      if (description.includes("\n")) {
        let formatDescription: string = "";
        const splitDescription = description.split("\n");
        let lines: string[] = [];

        splitDescription.forEach((value) => {
          let tempLines = this.doc.splitTextToSize(value, this.pageWidth - (this.x + this.xPadding) * 2) as string[];

          tempLines.forEach((tempValue) => {
            lines.push(tempValue);
          });
        });

        const totalLines: number = lines.length > 5 ? 5 : lines.length;

        for (let i = 0; i < totalLines; i++) {
          formatDescription += `${lines[i]}${i === totalLines ? "" : "\n"}`;
          let dim = this.doc.getTextDimensions(lines[i]);
          lineHeight += dim.h;
        }

        return [formatDescription, lineHeight + 2.5];
      } else {
        let formatDescription: string = "";
        const lines = this.doc.splitTextToSize(description, this.pageWidth - (this.x + this.xPadding) * 2) as string[];

        const totalLines: number = lines.length > 5 ? 5 : lines.length;

        for (let i = 0; i < totalLines; i++) {
          formatDescription += `${lines[i]}${i === totalLines ? "" : "\n"}`;
          let dim = this.doc.getTextDimensions(lines[i]);
          lineHeight += dim.h;
        }

        return [formatDescription, lineHeight + 2.5];
      }
    };

    let currentTitlePosition: number = 0;
    let currentImagePosition: number = 0;
    let currentDescriptionPosition: number = 0;
    let image: Uint8Array;
    let newImageWidth: number;
    let newImageHeight: number;
    let newDesc: string = "";
    let descHeight: number = 0;
    let previousLink: number = 0;

    for (const contentItem of contentData) {
      this.doc.setPage(Number(contentItem.linkNumber));

      // Set Section
      if (contentItem.status === "-") {
        this.doc.setFont("times", "bold");
        this.doc.setFontSize(sectionFontSize);
        const titleWidth = this.doc.getTextWidth(contentItem.title);
        const titlePosition = this.y + this.yPadding + 3;
        this.doc.text(contentItem.title, this.pageWidth / 2 - titleWidth / 2, titlePosition);

        continue;
      }

      // Set Title
      this.doc.setFont("times", "bold");
      this.doc.setFontSize(fontSize);
      if (Number(contentItem.linkNumber) !== previousLink && contentItem.title.includes(".1 ")) {
        currentTitlePosition = this.y + this.yPadding + titlePadding + 8;
      } else if (Number(contentItem.linkNumber) !== previousLink && !contentItem.title.includes(".1 ")) {
        currentTitlePosition = this.y + this.yPadding + titlePadding + 4;
      } else {
        currentTitlePosition = currentDescriptionPosition + descHeight + titlePadding;
      }
      this.doc.text(contentItem.title, this.x + this.xPadding, currentTitlePosition);

      // Set Image
      ({ image, newImageWidth, newImageHeight } = await getImageAndSize(contentItem.image));
      currentImagePosition = currentTitlePosition + imagePadding;
      this.doc.addImage(
        image,
        "PNG",
        this.pageWidth / 2 - newImageWidth / 2,
        currentImagePosition,
        newImageWidth,
        newImageHeight,
        "",
        "FAST"
      );

      // Set Description
      this.doc.setFont("times", "normal");
      currentDescriptionPosition = currentImagePosition + newImageHeight + descPadding;
      [newDesc, descHeight] = getDescriptionTotalHeight(contentItem.description);
      this.doc.text(newDesc, this.x + this.xPadding, currentDescriptionPosition);

      previousLink = Number(contentItem.linkNumber);
    }
  }

  private async wrapText(text: string, fontSize: number): Promise<[string, number]> {
    let newText = "";
    let lineHeight: number = 0;
    const lines = this.doc.splitTextToSize(text, this.pageWidth - (this.x + this.xPadding) * 2) as string[];

    for (let i = 0; i < lines.length; i++) {
      newText += `${lines[i]}${i !== lines.length - 1 ? "\n" : ""}`;
      let dim = this.doc.getTextDimensions(lines[i]);
      lineHeight += dim.h;
    }

    return [newText, lineHeight];
  }

  public async createReport(data: SectionData[]) {
    moment.locale("id");
    const coverData: CoverData = {
      projectName: "BNI API Gateway",
      activityName: "Regression Test",
      testCaseName: "SB_TAPCASH_V2_001",
      authorName: "Automation Team",
      date: moment().format("DD-MM-YYYY_HH:mm:ss"),
    };
    // Content Page
    const stepDataTotalLength = data.reduce((acc, cur) => acc + cur.step.length, 0);
    let contentTotalPage = 0;

    data.forEach((value, index) => {
      contentTotalPage += Math.ceil(value.step.length / 2);
    });

    const sectionTotalLength = data.length;
    // Harcoded Page
    const coverTotalPage = 1;
    const beritaAcaraTotalPage = 4;
    // Table Of Content Page
    const tocStartPage = 6;
    const tocFirstPageLength = 46;
    const tocRestPageLength = 51;
    const tocTotalPage =
      Math.ceil(Math.max(0, stepDataTotalLength + sectionTotalLength - tocFirstPageLength) / tocRestPageLength) + 1;
    const docSummStartPage = coverTotalPage + beritaAcaraTotalPage + tocTotalPage + 1;
    const docSummFirstPageLength = 34;
    const docSummRestPageLength = 40;
    const docSummTotalPage =
      Math.ceil(
        Math.max(0, stepDataTotalLength + sectionTotalLength + 1 - docSummFirstPageLength) / docSummRestPageLength
      ) + 1;
    // Total Page
    const totalPage = beritaAcaraTotalPage + tocTotalPage + docSummTotalPage + contentTotalPage;
    const startContentNum = coverTotalPage + beritaAcaraTotalPage + tocTotalPage + docSummTotalPage + 1;

    await this.createCover(coverData);

    for (let i = 0; i < totalPage; i++) {
      await this.addPage(totalPage + coverTotalPage);
    }

    await this.createBeritaAcaraPage1(2);
    await this.createBeritaAcaraPage2(3);
    await this.createBeritaAcaraPage3(4);
    await this.createBeritaAcaraPage4(5);

    // Create Summary and ContentData
    const summaryData: SummaryData[] = [];
    const contentData: ContentData[] = [];
    const summaryStatus: SummaryStatus = {
      totalPassed: data.reduce((acc, section) => {
        return acc + section.step.filter((step) => step.status.name === "PASSED").length;
      }, 0),
      totalFailed: data.reduce((acc, section) => {
        return acc + section.step.filter((step) => step.status.name === "FAILED").length;
      }, 0),
      totalDone: data.reduce((acc, section) => {
        return acc + section.step.filter((step) => step.status.name === "DONE").length;
      }, 0),
    };

    let linkNumber = startContentNum;

    data.forEach((sectionVal, sectionIdx) => {
      if (sectionIdx != 0) linkNumber++;

      const sectionBase = {
        title: `${sectionIdx + 1} ${sectionVal.section}`,
        linkNumber: linkNumber.toString(),
        status: "-",
      };

      summaryData.push(sectionBase);
      contentData.push({ ...sectionBase, description: "-", image: "-" });

      sectionVal.step.forEach((stepVal, stepIdx) => {
        const stepBase = {
          title: `${sectionIdx + 1}.${stepIdx + 1} ${stepVal.title}`,
          linkNumber: linkNumber.toString(),
          status: stepVal.status.name,
        };

        summaryData.push(stepBase);
        contentData.push({ ...stepBase, description: stepVal.description, image: stepVal.image });

        if ((stepIdx + 1) % 2 === 0 && stepIdx !== sectionVal.step.length - 1) linkNumber++;
      });
    });

    // Table of Content
    await this.createTableOfContent(summaryData, tocStartPage, docSummStartPage, tocFirstPageLength, tocRestPageLength);

    // Document Summary Pages
    await this.createDocumentSummary(
      summaryData,
      docSummStartPage,
      docSummFirstPageLength,
      docSummRestPageLength,
      summaryStatus
    );

    await this.createContent(contentData);

    const rPath = path.join(__dirname, "..", "report");

    const output = this.doc.output("arraybuffer");

    fs.writeFile(path.join(rPath, "report.pdf"), Buffer.from(output) as any, (err) => {
      if (err) {
        throw err;
      }
    });
  }
}

const dummyData: SectionData[] = [];

for (let i = 0; i < 10; i++) {
  const step: StepData[] = [];

  for (let j = 0; j < (i < 2 ? 20 : i < 4 ? 40 : i < 6 ? 60 : i < 8 ? 80 : 10); j++) {
    step.push({
      title: "Select Menu Transafer",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin cursus aliquet ligula, et tincidunt lectus. Quisque vel nulla mattis, pulvinar odio non, posuere diam. Phasellus fermentum nisl sed arcu vehicula scelerisque. Sed vulputate sodales mollis. Fusce condimentum est nibh, nec congue nulla dignissim ac. Curabitur a laoreet lorem. Maecenas tincidunt pharetra scelerisque. Mauris efficitur ligula eget feugiat interdum. Integer rutrum sem eros, eu porta felis sollicitudin sit amet. Nam sed dui finibus, tristique",
      image: j % 2 == 0 ? path.join(__dirname, "..", "ss3.png") : path.join(__dirname, "..", "mobile.png"),
      status: {
        name: j < 3 ? "DONE" : j < 6 ? "PASSED" : "FAILED",
      },
    });
  }

  dummyData.push({
    section: "Create Transaction",
    step: step,
  });
}

(async () => {
  const reportBuilder = new ReportBuilder();
  await reportBuilder.createReport(dummyData);
})();
