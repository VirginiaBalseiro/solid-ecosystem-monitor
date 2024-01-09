(()=>{const t="https://api.github.com/repositories/186702057/contents/meetings",e=["template.md","README.md"],n=document.querySelector("main > article"),a="https://raw.githubusercontent.com/w3c-cg/solid/main/elections/2023/ballots-anonymised.blt";let r=0;const i=(t,e)=>{const n=(e+1).toString();return`${t}-${1==n.length?`0${n}`:n}`};function s(t,e,a,r,i,s){var o=document.createElement("table");const d=document.createElement("caption");d.textContent=a,o.append(d);const c=document.createElement("tfoot"),l=document.createElement("tr"),p=document.createElement("td");if(p.colSpan=e.length,s){const t=document.createElement("dl");Object.keys(s).forEach((function(e){var n=document.createElement("dt"),a=document.createElement("dd");if(n.textContent=e,"Source"==e){var r=document.createElement("a");r.setAttribute("href",s[e]),r.textContent=s[e],a.appendChild(r)}else a.textContent=s[e];t.appendChild(n),t.appendChild(a)})),p.appendChild(t)}l.appendChild(p),c.appendChild(l);for(var m=document.createElement("thead"),h=document.createElement("tr"),u=0;u<e.length;u++){var f=document.createElement("th");f.textContent=e[u],h.appendChild(f)}m.appendChild(h);var g=document.createElement("tbody");t.forEach((t=>{r(t,g)})),o.appendChild(m),o.appendChild(g),o.appendChild(c),n.appendChild(o)}function o(e,a,i,s,o,d,c){const l=Math.max(20*e.length,n.getBoundingClientRect().width)-50-30,p=360,m=document.createElement("div");m.id=a,m.classList.add("chart");const h=document.createElement("h2");h.textContent=c,n.appendChild(h),n.appendChild(m);const u=d3.select(`#${a}`).append("svg").attr("width",l+50+30).attr("height",500).append("g").attr("transform","translate(50,20)"),f=u.append("g").attr("class","legend"),g=f.append("text").attr("x",0).attr("y",20);g.append("tspan").html(`Source: <a href="${t}">${t}</a>`).style("font-size","12px").attr("x",0),g.append("tspan").html(`Number of meetings: ${r}`).style("font-size","12px").attr("x",0).attr("dy","1.2em"),g.attr("transform",`translate(${l-f.node().getBoundingClientRect().width}, 0)`),m.id=a,m.classList.add("chart"),h.textContent=c,n.appendChild(h),n.appendChild(m);const x=d3.scalePoint().domain(e.map((t=>t[i]))).range([0,l]),C=d3.scaleLinear().domain([0,d3.max(e,(t=>t[s]))]).nice().range([p,0]),y=d3.line().x((t=>x(t[i]))).y((t=>C(t[s]))),b=d3.select(`#${a}`).append("div").attr("class","tooltip").style("position","absolute").style("opacity",0);u.append("path").datum(e).attr("class","line").attr("fill","none").attr("stroke","blue").attr("stroke-width",2).attr("d",y),u.append("g").attr("class","x-axis").attr("transform","translate(0, 360)").call((function(t){t.call(d3.axisBottom(x)).selectAll("text").style("text-anchor","end").attr("dx","-0.8em").attr("dy","0.15em").attr("transform","rotate(-45)")})),u.append("g").attr("class","y-axis").call(d3.axisLeft(C)),u.append("text").attr("x",l/2).attr("y",440).attr("text-anchor","middle").text(o),u.append("text").attr("transform","rotate(-90)").attr("x",-180).attr("y",-50).attr("dy","1em").style("text-anchor","middle").text(d),u.selectAll(".dot").data(e).enter().append("circle").attr("class","dot").attr("cx",(t=>x(t[i]))).attr("cy",(t=>C(t[s]))).attr("r",5).style("fill","blue").on("mouseover",((t,e)=>{b.transition().duration(200).style("opacity",.9);const n=b.node().offsetWidth,a=b.node().offsetHeight,r=t.pageX-n/2,c=t.pageY-a-10;b.html(`<strong>${o}:</strong> ${e[i]}<br><strong>${d}:</strong> ${e[s]}`).style("left",r+"px").style("top",c+"px")})).on("mouseout",(()=>{b.transition().duration(500).style("opacity",0)}))}function d(e,a,i,s,o,d,c){const l=100,p=Math.max(20*e.length,n.getBoundingClientRect().width)-l-60,m=320,h=document.createElement("div");h.id=a,h.classList.add("chart");const u=document.createElement("h2");u.textContent=c,n.appendChild(u),n.appendChild(h);var f=d3.select(`#${a}`).append("svg").attr("width",p+l+60).attr("height",500).append("g").attr("transform","translate(100,60)");const g=f.append("g").attr("class","legend"),x=g.append("text").attr("x",0).attr("y",20);x.append("tspan").html(`Source: <a href="${t}">${t}</a>`).style("font-size","12px").attr("x",0),x.append("tspan").html(`Number of meetings: ${r}`).style("font-size","12px").attr("x",0).attr("dy","1.2em"),x.attr("transform",`translate(${p-g.node().getBoundingClientRect().width}, 0)`);var C=d3.scaleBand().range([0,p]).padding(.1),y=d3.scaleLinear().range([m,0]);C.domain(e.map((function(t){return t[i]}))),y.domain([0,d3.max(e,(function(t){return t[s]}))]);const b=d3.select(`#${a}`).append("div").attr("class","tooltip").style("position","absolute").style("opacity",0);f.selectAll(".bar").data(e).enter().append("rect").attr("class","bar").attr("x",(function(t){return C(t[i])})).attr("width",C.bandwidth()).attr("y",(function(t){return y(t[s])})).attr("height",(function(t){return m-y(t[s])})).style("fill","blue").on("mouseover",(function(t,e){b.style("opacity",1);const n=b.node().offsetWidth,a=b.node().offsetHeight,r=t.pageX-n/2,o=t.pageY-a-10;b.html(`<strong>${e[i]}</strong> <br><strong>${d}:</strong> ${e[s]}`).style("left",r+"px").style("top",o+"px")})).on("mouseout",(function(){b.style("opacity",0)})),f.append("g").attr("class","x-axis").attr("transform","translate(0,320)").call(d3.axisBottom(C)).selectAll("text").style("text-anchor","end").attr("dx","-.8em").attr("dy",".15em").attr("transform","rotate(-45)"),f.append("g").attr("class","y-axis").call(d3.axisLeft(y)),f.append("text").attr("x",p/2).attr("y",440).style("text-anchor","middle").text(o),f.append("text").attr("x",-160).attr("y",-50).attr("transform","rotate(-90)").style("text-anchor","middle").text(d)}function c(t){const e=t.split("\n");let n=!1,a=0,r=[];const i=/\[([^\]]+)\]\([^)]+\)|\[([^\]]+)\]\([^\)]+\)|([^(]+)\s*\(([^)]+)\)|([^-]+)\s*-\s+([^-\s]+)|([^-]+) - \(([^)]+)\)|([^-]+) - ([^-]+)/;for(const t of e)if(t.startsWith("## Present"))n=!0;else if(n&&(t.startsWith("-")||t.startsWith("*"))){if(a++,"---"===t)continue;const e=t.match(i);if(!e){let e=0;t.startsWith("*")?e=t.indexOf("*")+1:t.startsWith("-")&&(e=t.indexOf("-")+1),t.includes(",")?r.push(t.substring(e,t.indexOf(",")).trim()):r.push(t.substring(e).trim())}if(e)for(let t=1;t<=8;t++)if(e[t]){let n=e[t].trim();if(n.startsWith("[")&&n.endsWith("]")){const t=n.match(/\[([^\]]+)\]/);t&&(n=t[1].trim())}n.match(/\s-\s/)&&!n.match(/\S+\s-\s\S+/)&&(n=n.split(" - ")[0]),n.includes(",")&&(n=n.split(",")[0]),n=n.replace(/[\*\[\]]/g,"").replace(/-\s*$/,""),r.push(n.trim());break}}else if(n&&a>0&&""===t.trim())break;return{participantsCount:a,present:r}}function l(t){const e=t.split("\n");let n=!1,a=[];for(let t=0;t<e.length;t++){const r=e[t],i=e[t+1];if(!r.includes("---"))if(r.endsWith("## Scribes")){if(n=!0,""===r.trim()&&i.startsWith("*")||i.startsWith("-"))continue}else if(n&&(r.startsWith("-")||r.startsWith("*")))a.push(r.substring(r.indexOf(" ")+1));else if(n&&""===r.trim()&&i&&!i.startsWith("*")&&!i.startsWith("-"))break}return a}!async function(){let p=!0;const m=document.createElement("div");m.id="progress-indicator-container";const h=document.createElement("progress"),u=document.createElement("label");u.setAttribute("for","progress-indicator"),u.textContent="Fetching data...",h.id="progress-indicator",h.value=0,h.max=100,m.appendChild(u),m.appendChild(h);try{const u=await fetch(t,{method:"GET"});if(p&&n.appendChild(m),u.ok){p=!1;const t=await u.json();r=t.length;const C={"Number of meetings":r},y=[],b=[],E=100/t.length;for(const n of t)if(h.value+=E,"file"===n.type&&n.name.endsWith(".md")&&!e.includes(n.name)){const t=n.download_url;let e;try{const a=await fetch(t);if(a.ok){e=await a.text();const{participantsCount:t,present:r}=c(e),i=l(e);b.push(...i),y.push({file:n,participantsCount:t,presentList:r})}}catch(t){return console.error("Error:",t.message),0}}const v={},$={};b.forEach((t=>{v[t]||(v[t]=0),v[t]=v[t]+1}));var f={};y.forEach((function(t){t.presentList.forEach((function(t){f[t]||(f[t]=0),f[t]++}))})),Object.keys(f).forEach((function(t){var e=f[t];$[t]=e}));const M=y.reduce(((t,e)=>{const n=new Date(e.file.name.substr(0,e.file.name.indexOf(".md"))),a=n.getFullYear(),r=n.getMonth(),i=`${a}-${r}`;return t[i]?(t[i].totalParticipantsCount+=e.participantsCount,t[i].fileCount+=1):t[i]={year:a,month:r,totalParticipantsCount:e.participantsCount,fileCount:1},t}),{}),k=Object.values(M).map((t=>({year:t.year,month:t.month,averageParticipantsCount:Math.floor(t.totalParticipantsCount/t.fileCount)})));if(!p){n.removeChild(m),s(y,["Meeting","Participants"],"Meeting participation",((t,e)=>{var n=document.createElement("tr");n.setAttribute("about","#"+t.file.sha),n.setAttribute("typeof","qb:Observation");var a=document.createElement("td");a.setAttribute("property","sdmx-dimension:refPeriod"),a.setAttribute("datatype","xsd:date");var r=document.createElement("a");r.href=t.file.html_url,r.textContent=t.file.name.slice(0,-3),a.appendChild(r),n.appendChild(a);var i=document.createElement("td");i.setAttribute("property","sdmx-measure:obsValue"),i.setAttribute("datatype","xsd:int"),i.textContent=t.participantsCount,n.appendChild(i),e.appendChild(n)}),0,C),o(y.map((t=>({date:t.file.name.substr(0,t.file.name.indexOf(".md")),participantsCount:t.participantsCount}))),"line-chart-meetings","date","participantsCount","Meeting","Participants","Meeting participation"),s(k,["Month","Average Participants"],"Average monthly participation",((t,e)=>{var n=document.createElement("tr"),a=document.createElement("td");a.textContent=i(t.year,t.month),n.appendChild(a);var r=document.createElement("td");r.textContent=`${Math.floor(t.averageParticipantsCount)}`,n.appendChild(r),e.appendChild(n)}),0,C),o(k.map((t=>({month:i(t.year,t.month),averageParticipantsCount:t.averageParticipantsCount}))),"line-chart-monthly","month","averageParticipantsCount","Month","Average Participants","Average monthly participation");var g=Object.keys(v).map((t=>({Name:t,"Meetings scribed":v[t]}))).filter((t=>t.Name.length&&"name"!==t.Name));g.sort(((t,e)=>e["Meetings scribed"]-t["Meetings scribed"])),s(g,["Name","Meetings scribed"],"Scribes",((t,e)=>{var n=document.createElement("tr"),a=document.createElement("td");a.textContent=t.Name,n.appendChild(a);var r=document.createElement("td");r.textContent=t["Meetings scribed"],n.appendChild(r),e.appendChild(n)}),0,C),d(g,"scribes-bar-chart","Name","Meetings scribed","Name","Meetings Scribed","Scribes");var x=Object.keys($).map((t=>({Name:t,"Meetings present":$[t]}))).filter((t=>t.Name.length&&"name"!==t.Name));x.sort(((t,e)=>e["Meetings present"]-t["Meetings present"])),s(x,["Name","Meetings present"],"Attendance per participant",((t,e)=>{var n=document.createElement("tr"),a=document.createElement("td");a.textContent=t.Name,n.appendChild(a);var r=document.createElement("td");r.textContent=t["Meetings present"],n.appendChild(r),e.appendChild(n)}),0,C),d(x,"present-bar-chart","Name","Meetings present","Name","Meetings present","Attendance per participant");try{const t=(await fetch(a).then((t=>t.text()))).split("\n"),e=t.slice(1,t.length-8).join("\n"),n={"Number of ballots":t.length-9,Source:a},r=function(t,e){s(Object.entries(t),["Candidate","Ranked 1st","Ranked 2nd","Ranked 3rd","Ranked 4th","Ranked 5th","Unranked"],"Election Results",((t,e)=>{const[n,{votes:a,unranked:r}]=t,[i,s,o,d,c]=a,l=i+s+o+d+c+r,p=document.createElement("tr"),m=document.createElement("td");m.textContent=n,p.appendChild(m),[i,s,o,d,c,r].forEach(((t,e)=>{const n=document.createElement("td"),a=(t/l*100).toFixed(2);n.textContent=`${String(t)} (${a}%)`,p.appendChild(n)})),e.appendChild(p)}),0,e)}(function(t){const e={};return t.trim().split("\n").forEach((t=>{const n=t.split(" ").slice(1,-1),a=new Set(Object.keys(e));n.forEach(((t,r)=>{e[t]||(e[t]={votes:Array(n.length).fill(0),unranked:0}),e[t].votes[r]++,a.delete(t)})),a.forEach((t=>{e[t].unranked++}))})),e}(e),n);console.log(r)}catch(t){console.log(t)}}}else console.error(`Failed to fetch directory contents. Status code: ${u.status}`)}catch(t){console.error("Error:",t.message)}}()})();