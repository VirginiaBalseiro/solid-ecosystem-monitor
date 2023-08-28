const githubApiUrl = `https://api.github.com/repositories/186702057/contents/meetings`;
const excludes = ["template.md", "README.md"];
const container = document.querySelector("main > article");

function drawTable(entries, headers, callback) {
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

function createLineChart(
  data,
  containerId,
  xAxisAccessor,
  yAxisAccessor,
  xAxisLabel,
  yAxisLabel
) {
  const margin = { top: 20, right: 30, bottom: 120, left: 50 };
  const width = data.length * 20 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const chartContainer = document.createElement("div");
  chartContainer.id = containerId;
  chartContainer.classList.add("chart");

  container.appendChild(chartContainer);

  const svg = d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scalePoint()
    .domain(data.map((d) => d[xAxisAccessor]))
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yAxisAccessor])])
    .nice()
    .range([height, 0]);

  const line = d3
    .line()
    .x((d) => xScale(d[xAxisAccessor]))
    .y((d) => yScale(d[yAxisAccessor]));

  svg
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("d", line);

  function customXAxis(g) {
    g.call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-45)");
  }

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(customXAxis);

  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 60)
    .attr("text-anchor", "middle")
    .text(xAxisLabel);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - height / 2)
    .attr("y", 0 - margin.left)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(yAxisLabel);
}

async function scrapeMeetingData() {
  let isLoading = true;

  const progressIndicatorContainer = document.createElement("div");
  progressIndicatorContainer.id = "progress-indicator-container";
  const progressIndicator = document.createElement("progress");
  const progressIndicatorLabel = document.createElement("label");
  progressIndicatorLabel.setAttribute("for", "progress-indicator");
  progressIndicatorLabel.textContent = "Fetching data...";
  progressIndicator.id = "progress-indicator";
  progressIndicator.value = 0;
  progressIndicator.max = 100;
  progressIndicatorContainer.appendChild(progressIndicatorLabel);
  progressIndicatorContainer.appendChild(progressIndicator);

  try {
    const response = await fetch(githubApiUrl, {
      method: "GET",
    });

    if (isLoading) {
      container.appendChild(progressIndicatorContainer);
    }

    if (response.ok) {
      isLoading = false;
      const files = await response.json();
      const entries = [];

      const valueIncrement = 100 / files.length;

      for (const file of files) {
        progressIndicator.value += valueIncrement;

        if (
          file.type === "file" &&
          file.name.endsWith(".md") &&
          !excludes.includes(file.name)
        ) {
          const markdownFileUrl = file.download_url;
          const participantsCount = await countParticipantsInFile(
            markdownFileUrl
          );
          entries.push({ file, participantsCount });
        }
      }

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

      if (!isLoading) {
        container.removeChild(progressIndicatorContainer);
        drawTable(entries, ["Meeting", "Participants"], (entry, tbody) => {
          var row = document.createElement("tr");
          row.setAttribute("about", "#" + entry.file.sha);
          row.setAttribute("typeof", "qb:Observation");
          var cell0 = document.createElement("td");
          cell0.setAttribute("property", "sdmx-dimension:refPeriod");
          cell0.setAttribute("datatype", "xsd:date");
          var a = document.createElement("a");
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

        drawTable(
          monthEntries,
          ["Month", "Average Participants"],
          (entry, tbody) => {
            var row = document.createElement("tr");
            var cell0 = document.createElement("td");
            cell0.textContent = `${entry.year}-${entry.month + 1}`;
            row.appendChild(cell0);
            var cell1 = document.createElement("td");
            cell1.textContent = `${Math.floor(entry.averageParticipantsCount)}`;
            row.appendChild(cell1);
            tbody.appendChild(row);
          }
        );

        // Create line charts
        createLineChart(
          entries.map((entry) => ({
            date: entry.file.name,
            participantsCount: entry.participantsCount,
          })),
          "line-chart-meetings",
          "date",
          "participantsCount",
          "Meeting",
          "Participants"
        );
        createLineChart(
          monthEntries.map((entry) => ({
            month: `${entry.year}-${entry.month + 1}`,
            averageParticipantsCount: entry.averageParticipantsCount,
          })),
          "line-chart-monthly",
          "month",
          "averageParticipantsCount",
          "Month",
          "Average Participants"
        );
      }
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
        } else if (participantsSection && (line.startsWith("-") || line.startsWith("*"))) {
          participantCount++;
        } else if (participantsSection && participantCount > 0 && line.trim() === "") {
          break;
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
