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
  k = 10;
  width = 2000;
  height = 1000;
  vertex = '';
  zoom = 400;
  simulation = null;
  links = null;
  nodes = null;
  link = null;
  linktext = null;
  node = null;
  svg = null;

  constructor(public basicService: BasicService) {
  }

  ngAfterContentInit() {
    d3.select("p").style("color", "red");
    this.svg = d3.select("svg");
  }

  ngOnInit() {
    this.basicService.getLimitedRows(this.k).subscribe(res => {
      for (let i of <Array<any>> res) {
        this.data.push(new yago(i));
      }
      console.log(this.data);
    })
  }

  searchVertex() {
    this.basicService.getVertex((this.vertex)).subscribe(res => {
      this.data = [];
      this.nodes = [];
      this.links = [];
      let temp = new Map();
      for (let i of <Array<any>> res) {
        this.data.push(new yago(i));
      }
      for (let i of this.data) {
        if (isNullOrUndefined(i.value)) {
          temp[i.subject] = 1;
          temp[i.object] = 1;
          this.links.push(Object.create({"source": i.subject, "target": i.object}));
        }
      }
      for(let i in temp) {
        this.nodes.push(Object.create({"id":i}));
      }
      console.log(this.data);
      console.log(this.nodes);
      console.log(this.links);
      this.drawGraph();
    })
  }

  changeZoom(newVal) {
    console.log(newVal);
    this.drawGraph();
  }

  drawGraph() {
    this.svg.selectAll("*").remove();
    this.simulation = d3.forceSimulation(this.nodes)
      .force("link", d3.forceLink(this.links).id(d => d.id).distance(this.zoom).strength(1))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));
    this.link = this.svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(this.links)
      .enter().append("g")
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);
    // this.link = this.svg.selectAll("path.link").data(this.links, function(d) {
    //   return d.source.id + "-" + d.target.id; });
    // this.link.enter().append("path").attr("class", "link");
    this.linktext = this.svg.append("g").selectAll("g.linklabelholder").data(this.links);
    this.linktext.enter().append("g").attr("class", "linklabelholder")
      .append("text")
      .attr("class", "linklabel")
      .style("font-size", "13px")
      .attr("x", "50")
      .attr("y", "-20")
      .attr("text-anchor", "start")
      .style("fill","#000")
      .append("textPath")
      .attr("xlink:href",function(d,i) { return "#linkId_" + i;})
      .text(function(d) {
        return "my text"; //Can be dynamic via d object
      });
    this.node = this.svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(this.nodes)
      .enter().append("g");
    this.node.append("circle")
      .attr("r", 5)
      .attr("fill", "#000");
    this.node.append("text")
      .text(function(d) {
        return d.id;
      })
      .attr('x', 6)
      .attr('y', 3);
    this.node.append("title")
      .text(function(d) { return d.id; });
    this.node.on("click", (d) => {
      this.vertex = d.id;
      this.searchVertex();
    });
    this.simulation.on("tick", () => {
      this.link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      this.linktext.attr("transform", function(d) {
        return "translate(" + (d.source.x + d.target.x) / 2 + ","
          + (d.source.y + d.target.y) / 2 + ")"; });
      this.node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
    });
  }

}
