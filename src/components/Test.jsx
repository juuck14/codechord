import * as d3 from "d3";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    COLOR_SCHEME,
    ROMAN_NUMERALS,
    STROKE_DASHARRAYS,
    ANIMATION,
    isEmpty,
    OPACITY,
    isSelected,
} from "../common";
import { toast } from "react-toastify";

const ParallelCoordinates = ({
    items,
    addedItem,
    setAddedItem,
    selectedItems,
    setSelectedItems,
	handleSongClick
}) => {
    const ref = useRef();
    const data = useMemo(() => {
        const newItems = items.reduce((arr, item, index) => {
            return [
                ...arr,
                ...item.chordsInfos.map((chordsInfo) => {
                    return {
                        ...chordsInfo,
                        song: item.song,
                        artist: item.artist,
                        id: item.id,
                        index,
                    };
                }),
            ];
        }, []);
        // console.log(items, newItems);
        return newItems;
    }, [items]);

    const sections = useMemo(() => {
        return [...new Set(data.map((d) => d.section))].sort();
    }, [data]);

    useEffect(() => {
        setSelectedItems(
            selectedItems.filter((item) =>
                data.some((d) => d.id === item.id && d.section === item.section)
            )
        );
        drawChart();
    }, [data]);

    const parseTooltip = (d) => {
        // console.log();

        return `
      <div style="font-weight: bold; color: ${COLOR_SCHEME[d.index]}">
        ${d.artist} - ${d.song}
      </div>
      <div>Section: ${d.section}</div>
      <div>Chords: ${d.chords
          .map((c) => ROMAN_NUMERALS[c.root - 1])
          .join(" - ")}</div>
    `;
    };

    const selectedItemsRef = useRef([]);
    const oldSelectedItemsRef = useRef([]);
    let opacityStartingValues = {}
    useEffect(() => {
        selectedItemsRef.current = selectedItems;
        d3.selectAll("path")
            .filter(d => !isEmpty(d) && isSelected(selectedItems, d))
            .each(function () {
                const opacity = d3.select(this).style("opacity");
                opacityStartingValues[this.__data__.id + "-" + this.__data__.section] = opacity;
            });
        drawChart();
        oldSelectedItemsRef.current = selectedItems;
    }, [selectedItems]);

    const tooltip = useRef();

    const drawChart = () => {
        const margin = { top: 30, right: 10, bottom: 10, left: 10 },
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        d3.select(ref.current).selectAll("*").remove(); // 기존 차트 삭제

        const svg = d3
            .select(ref.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 데이터의 차원 추출
        const dimensions = [0, 1, 2, 3, 4, 5, 6, 7];

        // 각 차원의 스케일
        const y = d3.scaleLinear().domain([1, 7]).range([height, 0]);

        const x = d3.scalePoint().range([0, width]).domain(dimensions);

        // 선 그리기 함수
        const path = (d) => {
            const points = d.chords.map(c => c.root);
            const validPoints = points.map(p => p >= 1 && p <= 7);
			const coords = dimensions.map(p => [x(p), y(points[p])]).filter((p, i) => validPoints[i] && p[1] !== undefined);

            return d3.line().curve(d3.curveCardinal.tension(.5))(coords);
        };

        let hoverTimeout;

        const getMyOpacity = (d, newSelectedItems) => {
            if (!d) return 1;
            if (newSelectedItems.length === 0) return OPACITY.DEFAULT;
            if (newSelectedItems.some((item) => item.id === d.id && item.section === d.section)) {
                return OPACITY.SELECTED;
            }
            return OPACITY.UNSELECTED;
        }
        
        const setEveryOpacity = (isRenew) => {
            if(isRenew){
                svg.selectAll("path")
                    .each(function () {
                        d3.select(this)
                            .style("opacity", d => {
                                if (!isEmpty(d) && isSelected(selectedItemsRef.current, d)) {
                                    return opacityStartingValues[d.id + "-" + d.section] || OPACITY.SELECTED;
                                }
                                return getMyOpacity(d, oldSelectedItemsRef.current);
                            })
                    })
            }
            svg.selectAll("path")
                .each(function () {
                    d3.select(this)
                        .transition()
                        .duration(ANIMATION.HOVER_DURATION)
                        .ease(ANIMATION.EASE)
                        .style("opacity", d => {
                            return getMyOpacity(d, selectedItemsRef.current);
                        });
                });
                
        };

        // 선 그리기
        svg.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", (d) => COLOR_SCHEME[d.index])
            .style("cursor", "pointer")
            .attr("stroke-width", 4)
            .each(function () {
                // d3.select(this)
                //   .attr("stroke-dasharray", d => STROKE_DASHARRAYS[d.section] || "")
                const totalLength = this.getTotalLength();
                
                if (addedItem && addedItem.id === this.__data__.id) {
                    console.log("애니메이션 시작", this.__data__);
                
                    d3.selectAll("path")
                        .filter(d => !isEmpty(d) && d.id !== this.__data__.id)
                        .transition()
                        .duration(ANIMATION.INOUT_DURATION)
                        .ease(ANIMATION.EASE)
                        .style("opacity", OPACITY.UNSELECTED)
                        .transition()
                        .duration(ANIMATION.MAIN_DURATION - ANIMATION.INOUT_DURATION)
                        .transition()
                        .duration(ANIMATION.INOUT_DURATION)
                        .ease(ANIMATION.EASE)
                        .style("opacity", d => getMyOpacity(d, selectedItemsRef.current));
                    
                    d3.select(this)
                        .style("opacity", OPACITY.SELECTED)
                        .attr(
                            "stroke-dasharray",
                            totalLength + " " + totalLength
                        )
                        .attr("stroke-dashoffset", totalLength)
                        .transition()
                        .duration(ANIMATION.MAIN_DURATION)
                        .ease(ANIMATION.EASE)
                        .attr("stroke-dashoffset", 0)
                        .transition()
                        .duration(ANIMATION.INOUT_DURATION)
                        .ease(ANIMATION.EASE)
                        .style("opacity", d => getMyOpacity(d, selectedItemsRef.current))
                        ;
                        
                    setTimeout(() => {
                        setAddedItem(null); // 애니메이션 후 addedItem 초기화
                    }, 10);
                } else {
                    setEveryOpacity(true);
                }
            })
            .on("mouseover", function (event, d) {
                clearTimeout(hoverTimeout);
                
                d3.select(this)
                .transition()
                .duration(ANIMATION.HOVER_DURATION)
                .style("opacity", OPACITY.SELECTED);

                tooltip.current.style.visibility = "visible";
                tooltip.current.innerHTML = parseTooltip(d);
            })
            .on("mousemove", function (event) {
                tooltip.current.style.top = event.pageY + 10 + "px";
                tooltip.current.style.left = event.pageX + 10 + "px";
            })
            .on("mouseout", function () {
                hoverTimeout = setTimeout(() => {
                    setEveryOpacity(false);
                }, 0);
                tooltip.current.style.visibility = "hidden";
            })
            .on("click", function (event, d) {
                handleSongClick(d);
            });

        // 각 축 그리기
        svg.selectAll(".dimension")
            .data(dimensions)
            .enter()
            .append("g")
            .attr("transform", (d) => `translate(${x(d)})`)
            .each(function (d) {
                d3.select(this).call(
                    d3
                        .axisLeft(y)
                        .ticks(7)
                        .tickFormat((d) => ROMAN_NUMERALS[d - 1])
                );
            })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text((d) => d+1)
            .style("fill", "black");
    };

    return (
        <div>
            <div ref={ref}></div>
            <div
                style={{
                    position: "absolute",
                    visibility: "hidden",
                    background: "#fff",
                    border: "1px solid #999",
                    borderRadius: "5px",
                    padding: "8px",
                    fontSize: "12px",
                    pointerEvents: "none",
                    boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                }}
                ref={tooltip}
            ></div>

            {/* <div className="flex flex-row">
        {sections.map((section, index) => (
          <div key={index} className="flex mr-2">
            <span>{section}</span>
          </div>
        ))}
      </div> */}
        </div>
    );
};

export default ParallelCoordinates;
