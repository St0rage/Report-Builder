import { jsPDF } from "jspdf";
import fs from "fs";
import autoTable, { CellHookData } from "jspdf-autotable";
import moment from "moment";
import path from "path";
import sharp from "sharp";

type Report = {
  project: {
    name: string;
  };
  test_case: {
    name: string;
  };
  tool: {
    name: string;
  };
  author: string;
  report_purpose: string;
};

type StepData = {
  title: string;
  description: string;
  image: string;
  status: {
    name: string;
  };
};

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

  private async addPage(
    title: string,
    projectName: string,
    author: string,
    tool: string,
    testCaseId: string,
    date: string,
    totalPage: number
  ) {
    const rows: string[][] = [
      ["Title", title],
      ["Author", author],
      ["Tools", tool],
      ["Test Case Id", testCaseId],
      ["Date", date],
    ];
    const headerPosition: number = 10;
    const headerTableFontSize: number = 10;
    const footerPosition: number = 17;
    const footerLineWidth: number = 0.3;
    const footerLeftText: string = "Confidential";
    const footerRightText: string = `Page ${this.page} of ${totalPage}`;
    const footerTextFontSize: number = 10;
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
      this.pageHeight - this.y + footerPosition + footerTextFontSize / 2.5 + footerLineWidth;

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
    const footerMiddleTextWidth: number = this.doc.getTextWidth(projectName);
    this.doc.text(projectName, this.pageWidth / 2 - footerMiddleTextWidth / 2, footerTextPosition);

    // Footer Right Text
    const footerRightTextWidth: number = this.doc.getTextWidth(footerRightText);
    this.doc.text(footerRightText, this.pageWidth - this.x - footerXPadding - footerRightTextWidth, footerTextPosition);

    // this.page = this.page + 1;
    // this.doc.rect(this.x, 0, 0, this.pageHeight);
    // this.doc.rect(this.pageWidth - this.x, 0, 0, this.pageHeight);
    // this.doc.rect(0, this.y, this.pageWidth, 0);
    // this.doc.rect(0, this.pageHeight - this.y, this.pageWidth, 0);
  }

  private async getImageBinary(path: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private async createCover(title: string, subTitle: string, author: string, testCaseId: string) {
    const titleFontSize: number = 26;
    const subTitleFontSize: number = 14;
    const authorText: string = `Author`.padEnd(18, " ") + `: ${author}`;
    const testCaseIdText: string = `Test Case Id`.padEnd(15, " ") + `: ${testCaseId}`;
    const authorFontSize: number = 12;
    const testCaseIdFontSize: number = 12;
    const imageWidth: number = 35;
    const imageHeight: number = 10;
    // const imageBuffer: Buffer = await this.getImageBinary("./LogoMandiri.png");
    // const image: string = `data:image/png;base64,${imageBuffer.toString(
    //   "base64"
    // )}`;
    // const image = new Image();
    // image.src = path.resolve("./LogoMandiri.png");
    const rawImage = await fs.promises.readFile("./LogoMandiri.png");
    const image = new Uint8Array(rawImage);

    // Set Image
    this.doc.addImage(image, "PNG", this.pageWidth - this.x - imageWidth, this.y, imageWidth, imageHeight, "", "FAST");

    // Set Title
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(titleFontSize);
    const titleWidth: number = this.doc.getTextWidth(title);
    this.doc.text(title, this.pageWidth - this.x - titleWidth, this.pageHeight / 2.5);

    // Set Sub Title
    this.doc.setFont("times", "italic");
    this.doc.setFontSize(subTitleFontSize);
    const subTitleWidth: number = this.doc.getTextWidth(subTitle);
    this.doc.text(subTitle, this.pageWidth - this.x - subTitleWidth, titleFontSize / 3 + this.pageHeight / 2.5);

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
    this.doc.text(testCaseIdText, this.pageWidth / 2 - bottomInformationWidth, this.pageHeight - this.y);

    // this.doc.rect(this.x, 0, 0, this.pageHeight);
    // this.doc.rect(this.pageWidth - this.x, 0, 0, this.pageHeight);
    // this.doc.rect(0, this.y, this.pageWidth, 0);
    // this.doc.rect(0, this.pageHeight - this.y, this.pageWidth, 0);
  }

  private async createTableOfContent(
    stepData: {}[],
    startPage: number,
    startReportPage: number,
    firstMaxPage: number,
    restMaxPage: number
  ) {
    let currentPage: number = startPage;
    const paddingTop: number = 3;
    const title: string = "Table of Content";
    const titleFontSize: number = 16;
    const firstContent: string = "Table of Content";
    const secondContent: string = "Document Summary";
    const contentFontSize: number = 12;
    const contentPadding: number = 5;
    const firstPagePaddingTopContent: number = this.y + titleFontSize + paddingTop + contentPadding;
    let tempContent: string;

    this.doc.setPage(currentPage);
    // Set Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, this.pageWidth / 2 - titleWidth / 2, this.y + paddingTop + titleFontSize / 2.5);

    const convertContentToDotted = (title: string, page: string) => {
      const titleWidth = this.doc.getTextWidth(title);
      const pageNumberWidth = this.doc.getTextWidth(page);
      const availableWidth = this.pageWidth - titleWidth - pageNumberWidth - this.x * 2;
      const dotWidth = this.doc.getTextWidth(".");
      const numberOfDots = Math.floor(availableWidth / dotWidth);

      const dots = ".".repeat(numberOfDots);

      return `${title}${dots}${page}`;
    };

    // Set Content Font
    this.doc.setFont("times", "normal");
    this.doc.setFontSize(contentFontSize);

    // Set First Content
    tempContent = convertContentToDotted(firstContent, currentPage.toString());

    this.doc.textWithLink(tempContent, this.x, firstPagePaddingTopContent, {
      pageNumber: currentPage,
    });

    // Set Second Content
    currentPage = Math.ceil(stepData.length / firstMaxPage) + currentPage;
    tempContent = convertContentToDotted(secondContent, currentPage.toString());
    this.doc.textWithLink(tempContent, this.x, firstPagePaddingTopContent + contentFontSize / 2.5, {
      pageNumber: currentPage,
    });

    // Set Rest Content
    currentPage = startPage + 1;
    let restCurrentPage = startReportPage;
    let currentPadding: number = 2;
    let currentPagePaddingTopContent: number = firstPagePaddingTopContent;
    let currentPageMaxContent: number = firstMaxPage;
    stepData.forEach((value: any, index: any) => {
      if (index === currentPageMaxContent) {
        currentPageMaxContent = currentPageMaxContent + restMaxPage;
        this.doc.setPage(currentPage);
        currentPadding = 1;
        currentPagePaddingTopContent = this.y + paddingTop;
        this.doc.setFont("times", "normal");
        this.doc.setFontSize(contentFontSize);
        currentPage = currentPage + 1;
      }
      tempContent = convertContentToDotted(`${index + 1}. ${value.title}`, restCurrentPage.toString());
      this.doc.textWithLink(
        tempContent,
        this.x,
        currentPagePaddingTopContent + (contentFontSize / 2.5) * currentPadding,
        { pageNumber: restCurrentPage }
      );
      currentPadding = currentPadding + 1;

      if (index % 2 != 0) {
        restCurrentPage = restCurrentPage + 1;
      }
    });
  }

  private async createDocumentSummary(
    stepData: {}[],
    startPage: number,
    startReportPage: number,
    firstMaxPage: number,
    restMaxPage: number,
    totalPassed: number,
    totalFailed: number,
    totalDone: number
  ) {
    let currentPage: number = startPage;
    const paddingTop: number = 3;
    const title: string = "Document Summary";
    const titleFontSize: number = 16;
    const summaryFontSize: number = 11;
    let currentStepIncremental = 1;
    let body: {}[][] = [];
    let rows: string[][] = [
      ["Total Passed", "Total Failed", "Total Done", "Total"],
      [
        totalPassed.toString(),
        totalFailed.toString(),
        totalDone.toString(),
        (totalPassed + totalFailed + totalDone).toString(),
      ],
    ];

    if (stepData.length <= firstMaxPage) {
      body.push(stepData.slice(0, stepData.length));
    }

    if (stepData.length > firstMaxPage) {
      body.push(stepData.slice(0, firstMaxPage));
      let stepDataLeft: number = stepData.length - firstMaxPage;
      let startIndex: number = firstMaxPage;
      for (let i = 1; i <= Math.ceil((stepData.length - firstMaxPage) / restMaxPage); i++) {
        if (stepDataLeft > restMaxPage) {
          body.push(stepData.slice(startIndex, startIndex + restMaxPage));
          stepDataLeft = stepDataLeft - restMaxPage;
          startIndex = startIndex + restMaxPage;
        } else {
          body.push(stepData.slice(startIndex, stepData.length));
        }
      }
    }

    this.doc.setPage(currentPage);
    // Set Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(titleFontSize);
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, this.pageWidth / 2 - titleWidth / 2, this.y + paddingTop + titleFontSize / 2.5);

    // Set Summary Total
    autoTable(this.doc, {
      head: [],
      body: rows,
      startY: this.y + titleFontSize + paddingTop,
      theme: "grid",
      styles: {
        fontSize: summaryFontSize,
        font: "times",
        fontStyle: "bold",
        cellPadding: {
          bottom: 0.5,
          top: 0.5,
        },
        lineColor: "black",
        textColor: "black",
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: (this.pageWidth - this.x * 2) / 4 },
        1: { cellWidth: (this.pageWidth - this.x * 2) / 4 },
        2: { cellWidth: (this.pageWidth - this.x * 2) / 4 },
        3: { cellWidth: (this.pageWidth - this.x * 2) / 4 },
      },
      margin: {
        left: this.x,
        right: this.x,
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
    });

    const statusColumnStyling = (data: CellHookData) => {
      data.cell.styles.fontStyle = "bold";
      data.cell.styles.halign = "center";
      data.cell.styles.cellPadding = { left: 0, bottom: 0.5, top: 0.5 };
      if (data.cell.text[0] === "PASSED") {
        data.cell.styles.textColor = "green";
      } else if (data.cell.text[0] === "FAILED") {
        data.cell.styles.textColor = [247, 59, 59];
      }
    };

    const stepColumnIncrement = (data: CellHookData) => {
      data.cell.text[0] = `${currentStepIncremental++}. ${data.cell.text[0]}`;
    };

    const statusColumnTextFormat = (data: CellHookData) => {
      data.cell.text[0] = data.cell.text[0].charAt(0).toUpperCase() + data.cell.text[0].slice(1).toLowerCase();
    };

    let currentStartPage: number = startReportPage;
    let restStartIndex: number = 0;

    for (let i = 0; i < body.length; i++) {
      this.doc.setPage(currentPage);
      autoTable(this.doc, {
        head: [],
        body: body[i],
        startY: i === 0 ? false : this.y + paddingTop,
        theme: "grid",
        styles: {
          fontSize: summaryFontSize,
          font: "times",
          fontStyle: "normal",
          textColor: "black",
          lineColor: "black",
          cellPadding: {
            bottom: 0.5,
            top: 0.5,
            left: 2,
          },
        },
        columnStyles: {
          1: { cellWidth: 20 },
        },
        margin: {
          left: this.x,
          right: this.x,
        },
        didParseCell: (data) => {
          if (data.row.index === 0 && i === 0) {
            data.cell.styles.fillColor = "gray";
            data.cell.styles.textColor = "white";
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.halign = "center";
            data.cell.styles.cellPadding = { left: 0, bottom: 0.5, top: 0.5 };
          }
          if (data.row.index > 0 && data.column.index === 1 && i === 0) {
            statusColumnStyling(data);
          }
          if (data.column.index === 1 && i > 0) {
            statusColumnStyling(data);
          }
          if (data.column.index === 0 && i > 0) {
            stepColumnIncrement(data);
          }
          if (data.column.index === 0 && data.row.index > 0 && i === 0) {
            stepColumnIncrement(data);
          }
          if (data.column.index === 1 && i > 0) {
            statusColumnTextFormat(data);
          }
          if (data.column.index === 1 && data.row.index > 0 && i === 0) {
            statusColumnTextFormat(data);
          }
        },
        didDrawCell: (data) => {
          if (data.row.index > 0 && data.column.index === 0 && i === 0) {
            this.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
              pageNumber: currentStartPage,
            });

            if ((data.row.index - 1) % 2 != 0) {
              currentStartPage = currentStartPage + 1;
            }
            restStartIndex = data.row.index;
          }
          if (data.column.index === 0 && i > 0) {
            data.row.index;
            this.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
              pageNumber: currentStartPage,
            });
            if ((data.row.index + 1) % 2 != 0) {
              currentStartPage = currentStartPage + 1;
            }
            restStartIndex++;
          }
        },
      });
      currentPage++;
    }
  }

  private async getImageAndSize(
    imagePath: string
  ): Promise<{ image: Uint8Array; newWidth: number; newHeight: number }> {
    const rawImage = await fs.promises.readFile(`${imagePath}`);
    const image = new Uint8Array(rawImage);
    const metadata = await sharp(image).metadata();
    const maxWidth = this.pageWidth - this.x * 2;

    // let newWidth = this.pageWidth - this.x * 2;
    // let newHeight = ((metadata?.height as number) / (metadata?.width as number)) * newWidth;

    let newHeight = (this.pageHeight - this.y * 2) / 2.4;
    // console.info(newHeight);
    let newWidth = ((metadata?.width as number) / (metadata?.height as number)) * newHeight;

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
    }

    return { image, newWidth, newHeight };
  }

  private async createContent(stepData: StepData[], startPage: number) {
    const fontSize: number = 12;
    const titlePadding: number = 1.5;
    const descriptionPadding: number = 5;
    const imageWidth = this.pageWidth - this.x * 2;
    const imageHeight = imageWidth / 2;
    const imagePadding: number = 3;

    let currentTitlePosition: number;
    let currentImagePosition: number;
    let currentDescriptionPosition: number = 0;
    let newDescription: string;
    let descriptionHeight: number = 0;
    let currentStartPage: number = startPage;
    let imageBuffer: Buffer;
    let image: string;
    let index: number = 0;

    this.doc.setFontSize(fontSize);

    const getDescriptionTotalHeight = (description: string): [string, number] => {
      const textHeight = fontSize / 2.5;

      if (description.includes("\n")) {
        let formatDescription: string = "";
        const splitDescription = description.split("\n");
        let lines: string[] = [];

        splitDescription.forEach((value) => {
          let tempLines = this.doc.splitTextToSize(value, this.pageWidth - this.x * 2) as string[];

          tempLines.forEach((tempValue) => {
            lines.push(tempValue);
          });
        });

        const totalLines: number = lines.length > 5 ? 5 : lines.length;
        const totalHeight: number = textHeight * splitDescription.length;

        for (let i = 0; i < totalLines; i++) {
          formatDescription += `${lines[i]}${i === totalLines ? "" : "\n"}`;
        }

        return [formatDescription, totalHeight];
      } else {
        let formatDescription: string = "";
        const lines = this.doc.splitTextToSize(description, this.pageWidth - this.x * 2) as string[];

        const totalLines: number = lines.length > 5 ? 5 : lines.length;
        const totalHeight: number = textHeight * totalLines;

        for (let i = 0; i < totalLines; i++) {
          formatDescription += `${lines[i]}${i === totalLines ? "" : "\n"}`;
        }

        return [formatDescription, totalHeight];
      }
    };

    for (const value of stepData) {
      // Set Title
      this.doc.setFont("Times", "bold");
      if (value.status.name === "FAILED") {
        this.doc.setTextColor(247, 59, 59);
      } else {
        this.doc.setTextColor(value.status.name === "DONE" ? "black" : "green");
      }

      if (index % 2 === 0) {
        this.doc.setPage(currentStartPage);
        currentTitlePosition = this.y + titlePadding * 2;
        currentStartPage++;
      } else {
        currentTitlePosition = currentDescriptionPosition + descriptionHeight + titlePadding;
      }

      this.doc.text(`${index + 1}. ${value.title}`, this.x, currentTitlePosition);

      // Set Image
      // imageBuffer = await this.getImageBinary(`./${value.image}`);
      // image = `data:image/png;base64,${imageBuffer.toString("base64")}`;
      // const image = new Image();
      // image.src = path.resolve(`./${value.image}`);
      // const rawImage = await fs.promises.readFile(`${value.image}`);
      // const image = new Uint8Array(rawImage);
      const { image, newWidth, newHeight } = await this.getImageAndSize(value.image);

      currentImagePosition = currentTitlePosition + imagePadding;
      // this.doc.addImage(image, "PNG", this.x, currentImagePosition, imageWidth, imageHeight, "", "FAST");
      // this.doc.addImage(image, "PNG", this.x, currentImagePosition, imageWidth, imageHeight, "", "FAST");

      this.doc.addImage(
        image,
        "PNG",
        this.pageWidth / 2 - newWidth / 2,
        currentImagePosition,
        newWidth,
        newHeight,
        "",
        "FAST"
      );
      // this.doc.addImage(image, "PNG", this.x, currentImagePosition, imageWidth, imageHeight, "", "FAST");

      // Set Description
      this.doc.setFont("Times", "normal");
      this.doc.setTextColor("black");

      currentDescriptionPosition = currentImagePosition + newHeight + descriptionPadding;
      [newDescription, descriptionHeight] = getDescriptionTotalHeight(value.description);
      this.doc.text(newDescription, this.x, currentDescriptionPosition);

      index++;
    }
  }

  public async createReport(report: Report, stepData: StepData[]) {
    moment.locale("id");
    const projectName: string = report.project.name;
    const title: string = `Test Automation for ${report.project.name}`;
    const subTitle: string = report.report_purpose;
    const author: string = report.author;
    const testCase: string = report.test_case.name;
    const tool: string = report.tool.name;
    const date: number = Date.now();
    const dateString: string = moment(date).format("DD-MMMM-YYYY_HH:mm:ss");
    const stepDataLength: number = stepData.length;
    const tableOfContentStartPage: number = 2;
    const tableOfContentFirstMaxPage: number = 41;
    const tableOfContentRestMaxPage: number = 46;
    const tableOfContentTotalPage: number =
      Math.ceil(Math.max(stepDataLength - tableOfContentFirstMaxPage) / tableOfContentRestMaxPage) + 1;
    const documentSummaryHeader: {} = { title: "Step Name", status: "Status" };
    const documentSummaryStartPage: number = tableOfContentTotalPage + 2;
    const documentSummaryFirstMaxPage: number = 34;
    const documentSummaryRestMaxPage: number = 40;
    const documentSummaryTotalPage: number =
      Math.ceil(Math.max(stepDataLength + 1 - documentSummaryFirstMaxPage) / documentSummaryRestMaxPage) + 1;

    const startPageReport: number = documentSummaryTotalPage + tableOfContentTotalPage + 2;
    const totalAllPage: number = Math.ceil(stepDataLength / 2) + tableOfContentTotalPage + documentSummaryTotalPage;
    let newStepData: {}[] = [];

    stepData.forEach((value) => {
      newStepData.push({
        title: value.title,
        status: value.status.name,
      });
    });

    await this.createCover(title, subTitle, author, testCase);

    for (let i = 0; i < totalAllPage; i++) {
      this.addPage(title, projectName, author, tool, testCase, dateString, totalAllPage + 1);
    }

    await this.createTableOfContent(
      newStepData,
      tableOfContentStartPage,
      startPageReport,
      tableOfContentFirstMaxPage,
      tableOfContentRestMaxPage
    );

    newStepData.unshift(documentSummaryHeader);

    await this.createDocumentSummary(
      newStepData,
      documentSummaryStartPage,
      startPageReport,
      documentSummaryFirstMaxPage,
      documentSummaryRestMaxPage,
      20,
      20,
      20
    );

    await this.createContent(stepData, startPageReport);

    // this.doc.save("report.pdf");

    const rPath = path.join(__dirname, "..", "report");

    const output = this.doc.output("arraybuffer");

    fs.writeFile(path.join(rPath, "report.pdf"), Buffer.from(output), (err) => {
      if (err) {
        throw err;
      }
    });
  }
}

let dummyData: StepData[] = [];

for (let i = 1; i <= 34; i++) {
  dummyData.push({
    title: `Click Submit ${i}`,
    description: `Expected : Memastikan Berhasil Click Submit ${i}\nActual : Berhasil Click Submit ${i}\nTransaction Id : 09827372716232`,
    // "Berhasil Mendapatkan Transaction Id, Berhasil Mendapatkan Transaction Id, Berhail MendapatkannMEndapatkan\nBerhasil Mendapatkan Transaction Id, Berhasil Mendapatkan Transaction Id, Berhail Mendapatkann\nBerhasil Mendapatkan Transaction Id, Berhasil Mendapatkan Transaction Id, Berhail Mendapatkann\nBerhasil Mendapatkan Transaction Id, Berhasil Mendapatkan Transaction Id, Berhail Mendapatkann\nBerhasil Mendapatkan Transaction Id, Berhasil Mendapatkan Transaction Id, Berhail Mendapatkann",
    // "Expected : Memastikan Berhasil Click Submit\nActual : Berhasil Click Submit\nSelect Language En\nActual: Memastikan BErhasil Login\nSelect Language",
    // "Berhasil Mendapatkan Transaction Id, Berhasil Mendapatkan Transaction Id, Berhail MendapatkannBerhasil Mendapatkan Transaction Id, Berhasil Mendapatkan Transaction Id, Berhail Mendapatkann",
    // "Loremipsumdolorsitamet,consecteturadipiscingelit.Seddoeiusmodtemporincididuntutlaboreetdoloremagnaaliqua.Utenimadminimveniam,quisnostrudexercitationullamcolaborisnisiutaliquipexeacommodoconsequat.Duisauteiruredolorinreprehenderitinvoluptatevelitessecillumdoloreeufugiatnullapariatur.Excepteursintoccaecatcupidatatnonproident,suntinculpaquiofficiadeseruntmollitanimidestlaborumsjhshhsbsndjaksdasdjns.",
    // "JqHYB8LmwTDzFuRsc6PMb5J9tv3OhCXgVjopInMdufZ7yWBKxP0k2EzAShNlaeqvwYtGr1DmoiCpRXLs0bfj5M7QKgnWLeTyZxU2N8VhJ6O9pFz3rcRqSaXkYcIVu4wBEbHnPJF2K7vtCs0ZjylOoApW1XedgMTiUB5GhkN4QsRmLrx1qjVP3vfc6p9MUzD0IsZoWt8Egb7dYSFLaiwnHrxjzKTVQPlqA92JeB",
    // "JqHYB8LmwTDzFuRsc6PMb5J9tv3OhCXgVjopInMdufZ7yWBKxP0k2EzAShNlaeqvwYtGr1DmoiCpRXLs0bfj5M7QKgnWLeTyZxU2N8VhJ6O9pFz3rcRqSaXkYcIVu4wBEbHnPJF2K7vtCs0ZjylOoApW1XedgMTiUB5GhkN4QsRmLrx1qjVP3vfc6p9MUzD0IsZoWt8Egb7dYSFLaiwnHrxjzKTVQPlqA92JeBaabbccddeeffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyzzAABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRSSTTUUVVWWXXYYZZ11223344556677889900JqHYB8LmwTDzFuRsc6PMb5J9tv3OhCXgVjopInMdufZ7yWBKxP0k2EzAShNlaeqvwYtGr1DmoiCpRXLs0bfj5M7QKgnWLeTyZxU2N8VhJ6O9pFz3rcRqSaXkYcIVu4wBEbHnPJF2K7vtCs0ZjylOoApW1XedgMTiUB5GhkN4QsRmLrx1qjVP3vfc6p9MUzD0IsZoWt8Egb7dYSFLaiwnHrxjzKTVQPlqA92JeB",
    image: path.join(__dirname, "..", `${i % 2 === 0 ? "ss3" : "mobile"}.png`),
    status: {
      name: i < 30 ? "DONE" : i < 70 ? "PASSED" : "FAILED",
    },
  });
}

const report = {
  project: {
    name: "TPS",
  },
  test_case: {
    name: "KP-9001",
  },
  tool: {
    name: "Selenium",
  },
  author: "AUTOMATION TEAM",
  report_purpose: "Regression Cycle 2 Test Report",
};

(async () => {
  const reportBuilder = new ReportBuilder();

  await reportBuilder.createReport(report, dummyData);
})();
