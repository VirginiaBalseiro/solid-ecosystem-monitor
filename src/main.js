const githubApiUrl = `https://api.github.com/repositories/186702057/contents/meetings`;
const excludes = ["template.md", "README.md"];
const container = document.querySelector("main > article");
const BALLOTS_URL =
  "https://raw.githubusercontent.com/w3c-cg/solid/main/elections/2023/ballots-anonymised.blt";
let meetingCount = 0;

function countVotes(ballotData) {
  const candidates = {};

  const rows = ballotData.trim().split("\n");

  rows.forEach((row) => {
    const candidateNumbers = row.split(" ").slice(1, -1);

    const unrankedCandidates = new Set(Object.keys(candidates));

    candidateNumbers.forEach((candidate, index) => {
      if (!candidates[candidate]) {
        candidates[candidate] = {
          votes: Array(candidateNumbers.length).fill(0),
          unranked: 0,
        };
      }
      candidates[candidate].votes[index]++;
      unrankedCandidates.delete(candidate);
    });

    unrankedCandidates.forEach((unrankedCandidate) => {
      candidates[unrankedCandidate].unranked++;
    });
  });

  return candidates;
}

function calculatePercentage(ballotData) {
  const candidates = countVotes(ballotData);

  const rows = ballotData.trim().split("\n");

  const totalVotes = rows.length;

  const percentages = {};

  Object.entries(candidates).forEach(([candidate, { votes, unranked }]) => {
    const firstPlaceVotes = votes[0];

    const unrankedVotes = unranked;

    percentages[candidate] = {
      firstPlace: (firstPlaceVotes / totalVotes) * 100,
      unranked: (unrankedVotes / totalVotes) * 100,
    };
  });

  return percentages;
}

function generateElectionTable(data, details) {

  const headers = [
    "Candidate",
    "Ranked 1st",
    "Ranked 2nd",
    "Ranked 3rd",
    "Ranked 4th",
    "Ranked 5th",
    "Unranked",
  ];

  const title = "Election Results";

  drawTable(
    Object.entries(data),
    headers,
    title,
    (entry, tbody) => {
      const [candidate, { votes, unranked }] = entry;
      const [firstPlace, secondPlace, thirdPlace, fourthPlace, fifthPlace] =
        votes;
      const totalVotes =
        firstPlace +
        secondPlace +
        thirdPlace +
        fourthPlace +
        fifthPlace +
        unranked;

      const row = document.createElement("tr");

      const candidateCell = document.createElement("td");
      candidateCell.textContent = candidate;
      row.appendChild(candidateCell);

      const cells = [
        firstPlace,
        secondPlace,
        thirdPlace,
        fourthPlace,
        fifthPlace,
        unranked,
      ];

      cells.forEach((value, index) => {
        const cell = document.createElement("td");
        const percentage = ((value / totalVotes) * 100).toFixed(2);
        cell.textContent = `${String(value)} (${percentage}%)`;
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    },
    "election",
    details
  );
}


const formatDate = (year, month) => {
  const monthString = (month + 1).toString();
  const formattedMonth =
    monthString.length == 1 ? `0${monthString}` : monthString;
  return `${year}-${formattedMonth}`;
};

function drawTable(entries, headers, title, callback, tableType, details) {
  var table = document.createElement("table");
  const caption = document.createElement("caption");
  caption.textContent = title;
  table.append(caption);

  const footer = document.createElement("tfoot");
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = headers.length;

  if (details) {
  const dl = document.createElement("dl");

  Object.keys(details).forEach(function(dt) {
    var dt1 = document.createElement("dt");
    var dd1 = document.createElement("dd");

    dt1.textContent = dt;

    if (dt == 'Source') {
      var a = document.createElement("a");
      a.setAttribute("href", details[dt]);
      a.textContent = details[dt];
      dd1.appendChild(a);
    }
    else {
      dd1.textContent = details[dt];
    }

    dl.appendChild(dt1);
    dl.appendChild(dd1);
  });

  td.appendChild(dl);
  }

  tr.appendChild(td);
  footer.appendChild(tr);

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

  table.appendChild(footer);

  container.appendChild(table);
}

function drawLineChart(
  data,
  containerId,
  xAxisAccessor,
  yAxisAccessor,
  xAxisLabel,
  yAxisLabel,
  title
) {
  const margin = { top: 20, right: 30, bottom: 120, left: 50 };
  const width =
    Math.max(data.length * 20, container.getBoundingClientRect().width) -
    margin.left -
    margin.right;
  const height = 500 - margin.top - margin.bottom;

  const chartContainer = document.createElement("div");
  chartContainer.id = containerId;
  chartContainer.classList.add("chart");

  const heading = document.createElement("h2");
  heading.textContent = title;

  container.appendChild(heading);
  container.appendChild(chartContainer);

  const svg = d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const legend = svg.append("g").attr("class", "legend");

  const legendText = legend.append("text").attr("x", 0).attr("y", 20);

  legendText
    .append("tspan")
    .html(`Source: <a href="${githubApiUrl}">${githubApiUrl}</a>`)
    .style("font-size", "12px")
    .attr("x", 0);

  legendText
    .append("tspan")
    .html(`Number of meetings: ${meetingCount}`)
    .style("font-size", "12px")
    .attr("x", 0)
    .attr("dy", "1.2em");

  legendText.attr(
    "transform",
    `translate(${width - legend.node().getBoundingClientRect().width}, 0)`
  );

  chartContainer.id = containerId;
  chartContainer.classList.add("chart");

  heading.textContent = title;

  container.appendChild(heading);

  container.appendChild(chartContainer);

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

  const tooltip = d3
    .select(`#${containerId}`)
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0);

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

  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(d[xAxisAccessor]))
    .attr("cy", (d) => yScale(d[yAxisAccessor]))
    .attr("r", 5)
    .style("fill", "blue")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);

      const tooltipWidth = tooltip.node().offsetWidth;
      const tooltipHeight = tooltip.node().offsetHeight;
      const xPosition = event.pageX - tooltipWidth / 2;
      const yPosition = event.pageY - tooltipHeight - 10;

      tooltip
        .html(
          `<strong>${xAxisLabel}:</strong> ${d[xAxisAccessor]}<br><strong>${yAxisLabel}:</strong> ${d[yAxisAccessor]}`
        )
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

function drawBarChart(
  data,
  containerId,
  xAxisAccessor,
  yAxisAccessor,
  xAxisLabel,
  yAxisLabel,
  title
) {
  const margin = { top: 60, right: 60, bottom: 120, left: 100 };
  const width =
    Math.max(data.length * 20, container.getBoundingClientRect().width) -
    margin.left -
    margin.right;
  const height = 500 - margin.top - margin.bottom;

  const chartContainer = document.createElement("div");
  chartContainer.id = containerId;
  chartContainer.classList.add("chart");

  const heading = document.createElement("h2");
  heading.textContent = title;

  container.appendChild(heading);
  container.appendChild(chartContainer);

  var svg = d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const legend = svg.append("g").attr("class", "legend");

  const legendText = legend.append("text").attr("x", 0).attr("y", 20);

  legendText
    .append("tspan")
    .html(`Source: <a href="${githubApiUrl}">${githubApiUrl}</a>`)
    .style("font-size", "12px")
    .attr("x", 0);

  legendText
    .append("tspan")
    .html(`Number of meetings: ${meetingCount}`)
    .style("font-size", "12px")
    .attr("x", 0)
    .attr("dy", "1.2em");

  legendText.attr(
    "transform",
    `translate(${width - legend.node().getBoundingClientRect().width}, 0)`
  );

  var x = d3.scaleBand().range([0, width]).padding(0.1);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain(
    data.map(function (d) {
      return d[xAxisAccessor];
    })
  );
  y.domain([
    0,
    d3.max(data, function (d) {
      return d[yAxisAccessor];
    }),
  ]);

  const tooltip = d3
    .select(`#${containerId}`)
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0);

  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
      return x(d[xAxisAccessor]);
    })
    .attr("width", x.bandwidth())
    .attr("y", function (d) {
      return y(d[yAxisAccessor]);
    })
    .attr("height", function (d) {
      return height - y(d[yAxisAccessor]);
    })
    .style("fill", "blue")
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 1);
      const tooltipWidth = tooltip.node().offsetWidth;
      const tooltipHeight = tooltip.node().offsetHeight;
      const xPosition = event.pageX - tooltipWidth / 2;
      const yPosition = event.pageY - tooltipHeight - 10;

      tooltip
        .html(
          `<strong>${d[xAxisAccessor]}</strong> <br><strong>${yAxisLabel}:</strong> ${d[yAxisAccessor]}`
        )
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  var xAxis = svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  xAxis
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 60)
    .style("text-anchor", "middle")
    .text(xAxisLabel);

  svg
    .append("text")
    .attr("x", 0 - height / 2)
    .attr("y", 0 - margin.left / 2)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text(yAxisLabel);
}

async function main() {
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
      meetingCount = files.length;
      const details = { 'Number of meetings': meetingCount };
      const entries = [];
      const scribes = [];

      const valueIncrement = 100 / files.length;

      for (const file of files) {
        progressIndicator.value += valueIncrement;

        if (
          file.type === "file" &&
          file.name.endsWith(".md") &&
          !excludes.includes(file.name)
        ) {
          const markdownFileUrl = file.download_url;
          let markdownContent;
          try {
            const response = await fetch(markdownFileUrl);
            if (response.ok) {
              markdownContent = await response.text();

              const { participantsCount, present } =
                countParticipantsInFile(markdownContent);
              const scribesInFile = getScribes(markdownContent);
              scribes.push(...scribesInFile);
              entries.push({ file, participantsCount, presentList: present });
            }
          } catch (error) {
            console.error("Error:", error.message);
            return 0;
          }
        }
      }

      const scribeCounts = {};
      const presentCounts = {};

      scribes.forEach((scribe) => {
        if (!scribeCounts[scribe]) {
          scribeCounts[scribe] = 0;
        }
        scribeCounts[scribe] = scribeCounts[scribe] + 1;
      });

      var nameCounts = {};

      entries.forEach(function (entry) {
        var presentList = entry.presentList;

        presentList.forEach(function (name) {
          if (!nameCounts[name]) {
            nameCounts[name] = 0;
          }

          nameCounts[name]++;
        });
      });

      var uniqueNames = Object.keys(nameCounts);

      uniqueNames.forEach(function (name) {
        var count = nameCounts[name];
        presentCounts[name] = count;
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
        averageParticipantsCount: Math.floor(
          entry.totalParticipantsCount / entry.fileCount
        ),
      }));

      if (!isLoading) {
        container.removeChild(progressIndicatorContainer);

        // Meeting participants

        drawTable(
          entries,
          ["Meeting", "Participants"],
          "Meeting participation",
          (entry, tbody) => {
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
          },
          "participation",
          details
        );

        drawLineChart(
          entries.map((entry) => ({
            date: entry.file.name.substr(0, entry.file.name.indexOf(".md")),
            participantsCount: entry.participantsCount,
          })),
          "line-chart-meetings",
          "date",
          "participantsCount",
          "Meeting",
          "Participants",
          "Meeting participation"
        );

        // Monthly average participants

        drawTable(
          monthEntries,
          ["Month", "Average Participants"],
          "Average monthly participation",
          (entry, tbody) => {
            var row = document.createElement("tr");
            var cell0 = document.createElement("td");
            cell0.textContent = formatDate(entry.year, entry.month);
            row.appendChild(cell0);
            var cell1 = document.createElement("td");
            cell1.textContent = `${Math.floor(entry.averageParticipantsCount)}`;
            row.appendChild(cell1);
            tbody.appendChild(row);
          },
          "participation",
          details
        );

        drawLineChart(
          monthEntries.map((entry) => ({
            month: formatDate(entry.year, entry.month),
            averageParticipantsCount: entry.averageParticipantsCount,
          })),
          "line-chart-monthly",
          "month",
          "averageParticipantsCount",
          "Month",
          "Average Participants",
          "Average monthly participation"
        );

        // Scribes

        var scribesTableData = Object.keys(scribeCounts)
          .map((key) => ({ Name: key, "Meetings scribed": scribeCounts[key] }))
          .filter((item) => item["Name"].length && item["Name"] !== "name");

        scribesTableData.sort(
          (a, b) => b["Meetings scribed"] - a["Meetings scribed"]
        );

        drawTable(
          scribesTableData,
          ["Name", "Meetings scribed"],
          "Scribes",
          (entry, tbody) => {
            var row = document.createElement("tr");
            var cell0 = document.createElement("td");
            cell0.textContent = entry.Name;
            row.appendChild(cell0);
            var cell1 = document.createElement("td");
            cell1.textContent = entry["Meetings scribed"];
            row.appendChild(cell1);
            tbody.appendChild(row);
          },
          "participation",
          details
        );

        drawBarChart(
          scribesTableData,
          "scribes-bar-chart",
          "Name",
          "Meetings scribed",
          "Name",
          "Meetings Scribed",
          "Scribes"
        );

        // Present
        var presenTableData = Object.keys(presentCounts)
          .map((key) => ({ Name: key, "Meetings present": presentCounts[key] }))
          .filter((item) => item["Name"].length && item["Name"] !== "name");

        presenTableData.sort(
          (a, b) => b["Meetings present"] - a["Meetings present"]
        );

        drawTable(
          presenTableData,
          ["Name", "Meetings present"],
          "Attendance per participant",
          (entry, tbody) => {
            var row = document.createElement("tr");
            var cell0 = document.createElement("td");
            cell0.textContent = entry.Name;
            row.appendChild(cell0);
            var cell1 = document.createElement("td");
            cell1.textContent = entry["Meetings present"];
            row.appendChild(cell1);
            tbody.appendChild(row);
          },
          "participation",
          details
        );

        drawBarChart(
          presenTableData,
          "present-bar-chart",
          "Name",
          "Meetings present",
          "Name",
          "Meetings present",
          "Attendance per participant"
        );

        //Election table
        // TODO: move this to dedicated page
        try {
          const electionData = await fetch(BALLOTS_URL).then((r) => r.text());
          const lines = electionData.split("\n");
          const ballots = lines.slice(1, lines.length - 8).join('\n');
          const ballotCount = lines.length - 9;
          const details = { 'Number of ballots': ballotCount, 'Source': BALLOTS_URL };
          const votes = countVotes(ballots);
          const table = generateElectionTable(votes, details);
          console.log(table);
        } catch (error) {
          console.log(error);
        }

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

function countParticipantsInFile(markdownContent) {
  const lines = markdownContent.split("\n");
  let participantsSection = false;
  let participantsCount = 0;
  let present = [];

  const nameRegex =
    /\[([^\]]+)\]\([^)]+\)|\[([^\]]+)\]\([^\)]+\)|([^(]+)\s*\(([^)]+)\)|([^-]+)\s*-\s+([^-\s]+)|([^-]+) - \(([^)]+)\)|([^-]+) - ([^-]+)/;

  for (const line of lines) {
    if (line.startsWith("## Present")) {
      participantsSection = true;
    } else if (
      participantsSection &&
      (line.startsWith("-") || line.startsWith("*"))
    ) {
      participantsCount++;
      if (line === "---") {
        continue;
      }

      const matches = line.match(nameRegex);

      if (!matches) {
        let startIndex = 0;
        if (line.startsWith("*")) {
          startIndex = line.indexOf("*") + 1;
        } else if (line.startsWith("-")) {
          startIndex = line.indexOf("-") + 1;
        }

        if (line.includes(",")) {
          present.push(line.substring(startIndex, line.indexOf(",")).trim());
        } else {
          present.push(line.substring(startIndex).trim());
        }
      }
      if (matches) {
        for (let i = 1; i <= 8; i++) {
          if (matches[i]) {
            let name = matches[i].trim();

            if (name.startsWith("[") && name.endsWith("]")) {
              const nameMatch = name.match(/\[([^\]]+)\]/);
              if (nameMatch) {
                name = nameMatch[1].trim();
              }
            }
            if (name.match(/\s-\s/) && !name.match(/\S+\s-\s\S+/)) {
              name = name.split(" - ")[0];
            }
            if (name.includes(",")) {
              name = name.split(",")[0];
            }
            name = name.replace(/[\*\[\]]/g, "").replace(/-\s*$/, "");

            present.push(name.trim());
            break;
          }
        }
      }
    } else if (
      participantsSection &&
      participantsCount > 0 &&
      line.trim() === ""
    ) {
      break;
    }
  }

  return { participantsCount, present };
}

function getScribes(markdownContent) {
  const lines = markdownContent.split("\n");
  let scribesSection = false;
  let scribes = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    if (line.includes("---")) {
      continue;
    }
    if (line.endsWith("## Scribes")) {
      scribesSection = true;
      if (
        (line.trim() === "" && nextLine.startsWith("*")) ||
        nextLine.startsWith("-")
      ) {
        continue;
      }
    } else if (
      scribesSection &&
      (line.startsWith("-") || line.startsWith("*"))
    ) {
      scribes.push(line.substring(line.indexOf(" ") + 1));
    } else if (
      scribesSection &&
      line.trim() === "" &&
      nextLine &&
      !(nextLine.startsWith("*") || nextLine.startsWith("-"))
    ) {
      break;
    }
  }

  return scribes;
}

main();
