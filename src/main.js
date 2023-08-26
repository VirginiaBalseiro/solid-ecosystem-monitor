const githubApiUrl = `https://api.github.com/repositories/186702057/contents/meetings`;
const excludes = ["template.md", "README.md"];
// const TOKEN = process.env.TOKEN;

function drawTable(entries, headers, callback) {
  const container = document.querySelector("main > article");
  var table = document.createElement("table");
  var thead = document.createElement("thead");
  var headerRow = document.createElement("tr");
  for (var i = 0; i < headers.length; i++) {
    var th = document.createElement("th");
    th.textContent = headers[i];
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);

  var tbody = document.createElement("tbody");

  entries.forEach((entry) => {
    callback(entry, tbody);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  container.appendChild(table);
}

async function scrapeMeetingData() {
  try {
    const response = await fetch(githubApiUrl, {
      method: "GET",
      // headers: {
      //   Authorization: `Bearer ${TOKEN}`,
      // },
    });

    if (response.ok) {
      const files = await response.json();
      const entries = [];

      for (const file of files) {
        if (
          file.type === "file" &&
          file.name.endsWith(".md") &&
          !excludes.includes(file.name)
        ) {
          const markdownFileUrl = file.download_url;
          const participantsCount = await countParticipantsInFile(
            markdownFileUrl
          );
          //   console.log(
          //     `Meeting: ${file.name}, Participants: ${participantsCount}`
          //   );
          entries.push({ file, participantsCount });
        }
      }

      drawTable(entries, ["Meeting", "Participants"], (entry, tbody) => {
console.log(entry);
        var row = document.createElement("tr");
        row.setAttribute("about", "#" + entry.file.sha);
        row.setAttribute("typeof", "qb:Observation");
        var cell0 = document.createElement("td");
        var a = document.createElement("a");
        a.setAttribute("property", "sdmx-dimension:refPeriod");
        a.setAttribute("datatype", "xsd:date");
        a.href = entry.file.html_url;
        a.textContent = entry.file.name.slice(0, -3);
        cell0.appendChild(a);
        row.appendChild(cell0);
        var cell1 = document.createElement("td");
        cell1.setAttribute("property", "sdmx-measure:obsValue");
        cell1.setAttribute("datatype", "xsd:int");
        cell1.textContent = entry.participantsCount;
        row.appendChild(cell1);
        tbody.appendChild(row);
      });

      const aggregatedEntries = entries.reduce((result, entry) => {
        const date = new Date(
          entry.file.name.substr(0, entry.file.name.indexOf(".md"))
        );
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;

        if (!result[key]) {
          result[key] = {
            year: year,
            month: month,
            totalParticipantsCount: entry.participantsCount,
            fileCount: 1,
          };
        } else {
          result[key].totalParticipantsCount += entry.participantsCount;
          result[key].fileCount += 1;
        }

        return result;
      }, {});

      const monthEntries = Object.values(aggregatedEntries).map((entry) => ({
        year: entry.year,
        month: entry.month,
        averageParticipantsCount:
          entry.totalParticipantsCount / entry.fileCount,
      }));

      drawTable(monthEntries, ["Month", "Average Participants"], (entry, tbody) => {
        // console.log(
        //   `Month: ${entry.year}-${
        //     entry.month + 1
        //   }, Average participants: ${Math.floor(
        //     entry.averageParticipantsCount
        //   )}`
        // );
        var row = document.createElement("tr");
        var cell0 = document.createElement("td");
        cell0.textContent = `${entry.year}-${entry.month + 1}`;
        row.appendChild(cell0);
        var cell1 = document.createElement("td");
        cell1.textContent = `${Math.floor(entry.averageParticipantsCount)}`;
        row.appendChild(cell1);
        tbody.appendChild(row);
      });
    } else {
      console.error(
        `Failed to fetch directory contents. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function countParticipantsInFile(fileUrl) {
  try {
    const response = await fetch(fileUrl);

    if (response.ok) {
      const markdownContent = await response.text();
      const lines = markdownContent.split("\n");
      let participantsSection = false;
      let participantCount = 0;

      for (const line of lines) {
        if (line.startsWith("## Present")) {
          participantsSection = true;
        } else if (participantsSection && line.trim() === "") {
          break;
        } else if (participantsSection) {
          participantCount++;
        }
      }

      return participantCount;
    } else {
      console.error(
        `Failed to fetch Markdown file. Status code: ${response.status}`
      );
      return 0;
    }
  } catch (error) {
    console.error("Error:", error.message);
    return 0;
  }
}

scrapeMeetingData();
