import { jsPDF } from "jspdf";
import fs from "fs";
import autoTable from "jspdf-autotable";

class ReportBuilder {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private x: number;
  private y: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [210, 297],
    });

    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.x = 20;
    this.y = 35;
  }

  public addPage() {
    const rows: string[][] = [
      ["Title", "Test Automation For Kopra SCM"],
      ["Author", "Automation Team"],
      ["Tools", "Selenium"],
      ["Test Case Id", "SCN_001"],
      ["Date", "31 July 2024"],
    ];
    const headerPosition: number = 10;
    const headerTableFontSize: number = 10;
    const footerPosition: number = 10;
    const footerLineWidth: number = 0.3;
    const footerLeftText: string = "Confidential";
    const footerMidleText: string = "Kopra SCM";
    const footerRightText: string = "Page 2 of 2";
    const footerTextFontSize: number = 8;
    const footerXPadding: number = 2;

    this.doc.addPage();

    // Create Header Table Information
    autoTable(this.doc, {
      head: [],
      body: rows,
      startY: headerPosition,
      theme: "grid",
      styles: {
        fontSize: headerTableFontSize,
        font: "times",
        fontStyle: "italic",
        cellPadding: {
          bottom: 0.2,
          top: 0.2,
          left: 2,
        },
        lineColor: "black",
        textColor: "black",
      },
      margin: {
        left: this.x,
        right: this.x,
      },
      columnStyles: {
        0: { cellWidth: 25 },
      },
      didParseCell: (data) => {
        if (data.row.index === 0 && data.column.index === 1) {
          data.cell.styles.fontStyle = "bolditalic";
        }
      },
    });

    // Create Footer Information
    this.doc.setFont("times", "italic");
    this.doc.setFontSize(footerTextFontSize);
    const footerTextPosition: number =
      this.pageHeight -
      this.y +
      footerPosition +
      footerTextFontSize / 2.5 +
      footerLineWidth;

    // Footer Line
    this.doc.setLineWidth(footerLineWidth);
    this.doc.line(
      this.x,
      this.pageHeight - this.y + footerPosition,
      this.pageWidth - this.x,
      this.pageHeight - this.y + footerPosition
    );

    // Footer Left Text
    this.doc.text(footerLeftText, this.x + footerXPadding, footerTextPosition);

    // Footer Middle Text
    const footerMiddleTextWidth: number =
      this.doc.getTextWidth(footerMidleText);
    this.doc.text(
      footerMidleText,
      this.pageWidth / 2 - footerMiddleTextWidth / 2,
      footerTextPosition
    );

    // Footer Right Text
    const footerRightTextWidth: number = this.doc.getTextWidth(footerRightText);
    this.doc.text(
      footerRightText,
      this.pageWidth - this.x - footerXPadding - footerRightTextWidth,
      footerTextPosition
    );

    // this.doc.rect(this.x, 0, 0, this.pageHeight);
    // this.doc.rect(this.pageWidth - this.x, 0, 0, this.pageHeight);
    // this.doc.rect(0, this.y, this.pageWidth, 0);
    // this.doc.rect(0, this.pageHeight - this.y, this.pageWidth, 0);
  }

  public createCover(
    title: string,
    subTitle: string,
    author: string,
    testCaseId: string
  ) {
    const titleFontSize: number = 26;
    const subTitleFontSize: number = 14;
    const authorText: string = `Author`.padEnd(18, " ") + `: ${author}`;
    const testCaseIdText: string =
      `Test Case Id`.padEnd(15, " ") + `: ${testCaseId}`;
    const authorFontSize: number = 12;
    const testCaseIdFontSize: number = 12;
    const imageWidth: number = 35;
    const imageHeight: number = 10;

    const image: string = `data:image/png;base64,${fs
      .readFileSync("./LogoMandiri.png")
      .toString("base64")}`;

    // Set Image
    this.doc.addImage(
      image,
      "PNG",
      this.pageWidth - this.x - imageWidth,
      this.y,
      imageWidth,
      imageHeight
    );

    // Set Title
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(titleFontSize);
    const titleWidth: number = this.doc.getTextWidth(title);
    this.doc.text(
      title,
      this.pageWidth - this.x - titleWidth,
      this.pageHeight / 2.5
    );

    // Set Sub Title
    this.doc.setFont("times", "italic");
    this.doc.setFontSize(subTitleFontSize);
    const subTitleWidth: number = this.doc.getTextWidth(subTitle);
    this.doc.text(
      subTitle,
      this.pageWidth - this.x - subTitleWidth,
      titleFontSize / 3 + this.pageHeight / 2.5
    );

    // Set Test Case Id Font And Size
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(testCaseIdFontSize);
    const testCaseIdWidth: number = this.doc.getTextWidth(testCaseIdText);

    // Set Author Font And Size
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(authorFontSize);
    const authorWidth: number = this.doc.getTextWidth(authorText);

    // Set BottomInformation Allignment
    let bottomInformationWidth: number;
    if (testCaseIdWidth > authorWidth) {
      bottomInformationWidth = testCaseIdWidth / 2;
    } else {
      bottomInformationWidth = authorWidth / 2;
    }

    // Set Author
    this.doc.text(
      authorText,
      this.pageWidth / 2 - bottomInformationWidth,
      this.pageHeight - this.y - authorFontSize / 2.5
    );

    // Set Test Case Id
    this.doc.text(
      testCaseIdText,
      this.pageWidth / 2 - bottomInformationWidth,
      this.pageHeight - this.y
    );

    this.doc.rect(this.x, 0, 0, this.pageHeight);
    this.doc.rect(this.pageWidth - this.x, 0, 0, this.pageHeight);
    this.doc.rect(0, this.y, this.pageWidth, 0);
    this.doc.rect(0, this.pageHeight - this.y, this.pageWidth, 0);
  }

  public createTableOfContent() {
    const paddingTop: number = 3;
    const title: string = "Table of Content";
    const titleFontSize: number = 16;

    // Set Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(
      title,
      this.pageWidth / 2 - titleWidth / 2,
      this.y + paddingTop + titleFontSize / 2.5
    );
  }

  public saveReport() {
    console.log(this.doc.getFontList());

    this.doc.save("report.pdf");
  }
}

const reportBuilder = new ReportBuilder();

reportBuilder.createCover(
  "Test Automation For Kopra SCM",
  "Regression Cycle 2 Test Report",
  "Dani Yudistira Maulana",
  "SCN_123123"
);
reportBuilder.addPage();
reportBuilder.createTableOfContent();

reportBuilder.saveReport();
