import {AfterContentInit, Component, OnInit} from '@angular/core';
import * as d3 from "d3";
import {BasicService} from "../services/basic.service";
import {yago} from "../models/yago.model";
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterContentInit, OnInit {
  title = 'kg-viz';
  data = [];
  rawData = [];
  k = 10;
  width = 1400;
  height = 1400;
  vertex = '';
  propVertex = '';
  prop = [];
  zoom = 400;
  simulation = null;
  links = null;
  rawLinks = null;
  nodes = null;
  rawNodes = null;
  link = null;
  linktext = null;
  node = null;
  svg = null;
  isLoading = false;

  constructor(public basicService: BasicService) {
  }

  ngAfterContentInit() {
    d3.select("p").style("color", "red");
  }

  ngOnInit() {
    this.basicService.getLimitedRows(this.k).subscribe(res => {
      for (let i of <Array<any>> res) {
        this.data.push(new yago(i));
      }
      console.log(this.data);
    })
  }

  searchVertex(v: string) {
    if (!isNullOrUndefined(v)) {
      this.vertex = v;
    }
    this.isLoading = true;
    this.propVertex = '';
    this.prop = [];
    this.basicService.getVertex((this.vertex)).subscribe(res => {
      this.rawData = [];
      this.rawNodes = [];
      this.rawLinks = [];
      let temp = new Map();
      for (let i of <Array<any>> res) {
        this.rawData.push(new yago(i));
      }
      for (let i of this.rawData) {
        if (isNullOrUndefined(i.value)) {
          temp[i.subject] = 1;
          temp[i.object] = 1;
          this.rawLinks.push(Object.create({"source": i.subject, "target": i.object, "label": i.predicate}));
        }
      }
      for (let i in temp) {
        this.rawNodes.push(Object.create({"id": i}));
      }
      this.data = this.rawData;
      this.nodes = this.rawNodes;
      this.links = this.rawLinks;
      if(this.nodes.length > 0 && this.links.length > 0)
        this.drawGraph();
      else
        d3.select("svg").selectAll("*").remove();
      this.isLoading = false;
      console.log(this.data);
      console.log(this.nodes);
      console.log(this.links);
    })
  }

  getProp()
  {
    this.isLoading = true;
    this.prop = [];
    this.basicService.getProp((this.propVertex)).subscribe(res => {
      for (let i of <Array<any>> res) {
        this.prop.push(new yago(i));
      }
      this.links = this.rawLinks.filter(l => l.source.id === this.propVertex || l.target.id === this.propVertex);
      let temp = new Map();
      for (let i of this.links) {
          temp[i.source.id] = 1;
          temp[i.target.id] = 1;
      }
      this.nodes = this.rawNodes.filter(v => v.id in temp);
      this.drawGraph();
      this.isLoading = false;
    });
  }

  reset(){
    this.isLoading = true;
    this.nodes = this.rawNodes;
    this.links = this.rawLinks;
    if(this.nodes.length > 0 && this.links.length > 0)
      this.drawGraph();
    else
      d3.select("svg").selectAll("*").remove();
    this.propVertex = '';
    this.prop = [];
    this.isLoading = false;
  }

  changeZoom(newVal) {
    console.log(newVal);
    this.width = this.zoom * 3.5;
    this.height = this.zoom * 3.5;
    if(this.nodes.length > 0 && this.links.length > 0)
      this.drawGraph();
    else
      d3.select("svg").selectAll("*").remove();
  }

  drawGraph() {
    this.svg = d3.select("svg");
    this.svg.selectAll("*").remove();
    let force = this.simulation = d3.forceSimulation(this.nodes)
      .force("link", d3.forceLink(this.links).id(d => d.id).distance(this.zoom).strength(1))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));

    let link = this.svg.selectAll("line")
      .data(this.links)
      .enter()
      .append("line")
      .attr("id", function (d, i) {
        return 'edge' + i
      })
      .attr('marker-end', 'url(#arrowhead)')
      .style("stroke", "#ccc")
      .style("pointer-events", "none");

    let edgepaths = this.svg.selectAll(".edgepath")
      .data(this.links)
      .enter()
      .append('path')
      .attr('d', function (d) {
        return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
      })
      .attr('class', 'edgepath')
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2)
      .attr('fill-opacity', 0)
      .attr('fill', 'blue')
      .attr('id', function (d, i) {
        return 'edgepath' + i
      })
      .style("pointer-events", "none");

    let edgelabels = this.svg.selectAll(".edgelabel")
      .data(this.links)
      .enter()
      .append('text')
      .style("pointer-events", "none")
      .attr('class', 'edgelabel')
      .attr('id', function (d, i) {
        return 'edgelabel' + i
      })
      .attr('dx', this.zoom/2)
      .attr('dy', 0)
      .attr('font-size', 10)
      .attr('fill', '#ff090c');

    edgelabels.append('textPath')
      .attr('xlink:href', function (d, i) {
        return '#edgepath' + i
      })
      .style("pointer-events", "none")
      .text(function (d, i) {
        return d.label
      });


    let node = this.svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(this.nodes)
      .enter().append("g");
    node.append("circle")
      .attr("r", 5)
      .attr("fill", "#000");
    let nodelabel = node.append("text")
      .text(function (d) {
        return d.id;
      })
      .attr('font-size', 10)
      .attr('x', 6)
      .attr('y', 10);
    node.append("title")
      .text(function (d) {
        return d.id;
      });
    node.on("click", (d) => {
      this.propVertex = d.id;
      this.getProp();
    });


    this.svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#0f0f0f')
      .attr('stroke', '#090909');


    force.on("tick", function () {

      link.attr({
        "x1": function (d) {
          return d.source.x;
        },
        "y1": function (d) {
          return d.source.y;
        },
        "x2": function (d) {
          return d.target.x;
        },
        "y2": function (d) {
          return d.target.y;
        }
      });

      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

      edgepaths.attr('d', function (d) {
        return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
      });

      edgelabels.attr('transform', function (d, i) {
        if (d.target.x < d.source.x) {
          let bbox = this.getBBox();
          let rx = bbox.x + bbox.width / 2;
          let ry = bbox.y + bbox.height / 2;
          return 'rotate(180 ' + rx + ' ' + ry + ')';
        }
        else {
          return 'rotate(0)';
        }
      });
    });
  }

}
