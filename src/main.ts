import { jsPDF } from "jspdf";
import fs from "fs";
import autoTable from "jspdf-autotable";

class ReportBuilder {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private x: number;
  private y: number;
  private page: number;

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
    this.page = 2;
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
    const footerRightText: string = `Page 2 of ${this.page}`;
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

    this.page = this.page + 1;
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

    // this.doc.rect(this.x, 0, 0, this.pageHeight);
    // this.doc.rect(this.pageWidth - this.x, 0, 0, this.pageHeight);
    // this.doc.rect(0, this.y, this.pageWidth, 0);
    // this.doc.rect(0, this.pageHeight - this.y, this.pageWidth, 0);
  }

  private convertContentToDotted(title: string, page: string): string {
    const titleWidth = this.doc.getTextWidth(title);
    const pageNumberWidth = this.doc.getTextWidth(page);
    const availableWidth =
      this.pageWidth - titleWidth - pageNumberWidth - this.x * 2;
    const dotWidth = this.doc.getTextWidth(".");
    const numberOfDots = Math.floor(availableWidth / dotWidth);

    const dots = ".".repeat(numberOfDots);

    return `${title}${dots}${page}`;
  }

  public createTableOfContent() {
    const paddingTop: number = 3;
    const title: string = "Table of Content";
    const titleFontSize: number = 16;
    let currentPage: number = 2;

    this.addPage();
    // Set Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(
      title,
      this.pageWidth / 2 - titleWidth / 2,
      this.y + paddingTop + titleFontSize / 2.5
    );

    // Set Content Index
    const firstIndex: string = "Table of Content";
    const secondIndex: string = "Document Summary";
    const contentFontSize: number = 12;
    const firstPagePaddingTopContent: number =
      this.y + titleFontSize + paddingTop + 5;
    const firstPageMaxContent: number = 41;
    const resPagetMaxContent: number = 47;
    const dummyData = [
      {
        title: "Select Language",
        description: "Berhasil Memilih Bahasa Indonesia",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Set Company Id",
        description: "Berhasil Input Company Id",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Set Username",
        description: "Berhasil Input Username",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Set Password",
        description: "Berhasil Input Password",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Click Login",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Transaction Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
      {
        title: "Berhasil Get Invoice Id",
        description: "Berhasil Click Login",
        image: "ahsdkjashkdjasd.png",
        status: "PASSED",
      },
    ];

    console.log(dummyData.length);
    let tempContent: string;
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(contentFontSize);

    // Set First Content Index
    tempContent = this.convertContentToDotted(
      firstIndex,
      currentPage.toString()
    );

    this.doc.text(tempContent, this.x, firstPagePaddingTopContent);
    this.doc.link(
      this.x,
      firstPagePaddingTopContent - 5,
      this.doc.getTextWidth(tempContent),
      contentFontSize / 2.5,
      { pageNumber: currentPage }
    );
    // Set Second Content Index
    currentPage =
      Math.ceil(dummyData.length / firstPageMaxContent) + currentPage;
    tempContent = this.convertContentToDotted(
      secondIndex,
      currentPage.toString()
    );
    this.doc.text(
      tempContent,
      this.x,
      firstPagePaddingTopContent + contentFontSize / 2.5
    );
    this.doc.link(
      this.x,
      firstPagePaddingTopContent + contentFontSize / 2.5 - 5,
      this.doc.getTextWidth(tempContent),
      contentFontSize / 2.5,
      { pageNumber: 3 }
    );

    // Set Rest Content
    currentPage = currentPage + 1;
    let currentPadding: number = 2;
    let currentPagePaddingTopContent: number = firstPagePaddingTopContent;
    let currentPageMaxContent: number = firstPageMaxContent;
    dummyData.forEach((value, index) => {
      if (index - 1 === currentPageMaxContent) {
        currentPageMaxContent = currentPageMaxContent + resPagetMaxContent;
        this.addPage();
        currentPadding = 1;
        currentPagePaddingTopContent = this.y + paddingTop;
        this.doc.setFont("times", "normal");
        this.doc.setFontSize(contentFontSize);
      }
      tempContent = this.convertContentToDotted(
        `${index + 1}. ${value.title}`,
        currentPage.toString()
      );
      this.doc.text(
        tempContent,
        this.x,
        currentPagePaddingTopContent + (contentFontSize / 2.5) * currentPadding
      );
      currentPadding = currentPadding + 1;

      if (index % 2 != 0) {
        currentPage = currentPage + 1;
      }
    });
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
reportBuilder.createTableOfContent();

reportBuilder.saveReport();
