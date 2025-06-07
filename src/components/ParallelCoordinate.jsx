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
    chordToString,
    PARALLEL_COORDINATE_STYLE,
} from "../common";
import { toast } from "react-toastify";
import seedrandom from "seedrandom";

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
        <div style="font-weight: bold;">
            <div
            class="color-indicator-sm"
            style="background-color: ${COLOR_SCHEME[d.index]}">
            </div>
            ${d.artist} - ${d.song}
        </div>
        <div>Section : ${d.section}</div>
        <div>Chords : ${d.chords
            .map((c) => chordToString(c, d.key))
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

        d3.select(ref.current).selectAll("*").remove(); // 기존 차트 삭제

        const svg = d3
            .select(ref.current)
            .append("svg")
            .attr("width", PARALLEL_COORDINATE_STYLE.WIDTH)
            .attr("height", PARALLEL_COORDINATE_STYLE.HEIGHT)
            .append("g")
            // .attr("transform", `translate(${PARALLEL_COORDINATE_STYLE.MARGIN.LEFT},${PARALLEL_COORDINATE_STYLE.MARGIN.TOP})`);  

        // 데이터의 차원 추출
        const dimensions = [0, 1, 2, 3, 4, 5, 6, 7];

        // 각 차원의 스케일
        const y = d3.scaleLinear().domain([1, 7]).range([PARALLEL_COORDINATE_STYLE.GRAPH_HEIGHT - PARALLEL_COORDINATE_STYLE.MARGIN.BOTTOM, PARALLEL_COORDINATE_STYLE.MARGIN.TOP]);

        const x = d3.scalePoint().range([PARALLEL_COORDINATE_STYLE.MARGIN.LEFT, PARALLEL_COORDINATE_STYLE.WIDTH - PARALLEL_COORDINATE_STYLE.MARGIN.RIGHT]).domain(dimensions);

        // 선 그리기 함수
        const path = (d) => {
            const roots = d.chords.map(c => c.root);
            const validRoots = roots.map(root => root >= 1 && root <= 7);
			const coords = dimensions.map(p => {
                let root = roots[p];
                const rng = new seedrandom(d.id + "-" + d.section + "-" + p);
                let offset = 0;
                const magnitude = 0.15
                if (root == 1) {
                    offset = rng()
                } else if (root == 7) {
                    offset = -rng()
                } else {
                    offset = (rng() - 0.5); // -0.05 ~ 0.05
                }
                offset *= magnitude;
                
                return [x(p), y(root + offset)];
            }).filter((p, i) => validRoots[i] && p[1] !== undefined);

            return d3.line().curve(d3.curveCardinal.tension(0.7))(coords);
        };

        let hoverTimeout;
        let isAnimationRunning = false;

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
                        //.attr("stroke-dasharray", d => STROKE_DASHARRAYS[d.section] || "")
                        .transition()
                        .duration(ANIMATION.HOVER_DURATION)
                        .ease(ANIMATION.EASE)
                        .style("opacity", d => {
                            return getMyOpacity(d, selectedItemsRef.current);
                        });
                });
                
        };

        const defs = svg.append("defs");

        // 데이터마다 unique gradient 생성
        COLOR_SCHEME.forEach((color, i) => {
            const gradient = defs.append("linearGradient")
                .attr("id", `line-gradient-${i}`)
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", PARALLEL_COORDINATE_STYLE.WIDTH)
                .attr("y2", 0);

            function gentleShade(color, brightenAmount = 10) {
                let hcl = d3.hcl(color);
                hcl.l = Math.min(100, hcl.l + brightenAmount);
                return hcl.toString();
            }


            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", color);

            gradient.append("stop")
                .attr("offset", "25%")
                .attr("stop-color", gentleShade(color));

            gradient.append("stop")
                .attr("offset", "50%")
                .attr("stop-color", color);

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", gentleShade(color));
        });

        svg.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", (d, i) => `url(#line-gradient-${d.index})`)
            .style("cursor", "pointer")
            .attr("stroke-width", 3)
            .each(function () {
                const totalLength = this.getTotalLength();
                
                if (addedItem && addedItem.id === this.__data__.id) {
                    console.log("애니메이션 시작", this.__data__);
                    isAnimationRunning = true;
                    setTimeout(() => {
                        isAnimationRunning = false;
                    }, ANIMATION.MAIN_DURATION + ANIMATION.INOUT_DURATION);

                    d3.selectAll("path")
                        .filter(d => !isEmpty(d) && d.id !== this.__data__.id)
                        //.attr("stroke-dasharray", d => STROKE_DASHARRAYS[d.section] || "")
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
                        //.attr("stroke-dasharray", d => STROKE_DASHARRAYS[d.section] || "")
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
                if (isAnimationRunning) return; // 애니메이션 중에는 마우스 오버 이벤트 무시
                clearTimeout(hoverTimeout);
                
                d3.select(this)
                .transition()
                .duration(ANIMATION.HOVER_DURATION)
                .style("opacity", OPACITY.SELECTED);

                tooltip.current.style.visibility = "visible";
                tooltip.current.innerHTML = parseTooltip(d);
            })
            .on("mousemove", function (event) {
                if (isAnimationRunning) return; // 애니메이션 중에는 마우스 무브 이벤트 무시
                tooltip.current.style.top = event.pageY + 10 + "px";
                tooltip.current.style.left = event.pageX + 10 + "px";
            })
            .on("mouseout", function () {
                if (isAnimationRunning) return; // 애니메이션 중에는 마우스 아웃 이벤트 무시
                hoverTimeout = setTimeout(() => {
                    setEveryOpacity(false);
                }, 0);
                tooltip.current.style.visibility = "hidden";
            })
            .on("click", function (event, d) {
                if (isAnimationRunning) return; // 애니메이션 중에는 클릭 이벤트 무시
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
                        .tickSize(PARALLEL_COORDINATE_STYLE.TICK_SIZE)
                        .tickFormat((d) => ROMAN_NUMERALS[d - 1])
                        .tickPadding(PARALLEL_COORDINATE_STYLE.TICK_PADDING)
                );
            })
            .append("text")
            .attr("class", "x-label")
            .attr("y", PARALLEL_COORDINATE_STYLE.GRAPH_HEIGHT + PARALLEL_COORDINATE_STYLE.X_LABEL_MARGIN.TOP)
            .text((d) => `Bar ${d+1}`)

    };

    return (
        <>
            <div className="parallel-coordinates">
                <div className="title-area">Chord Progression Patterns Across Songs</div>
                <div className="graph-area" ref={ref}></div>
                <div className="legend-area">
                    {items.map((item, index) => (
                        <div className={`legend-item ${selectedItems.length == 0 || selectedItems.some(v => v.id === item.id)? '' : 'unselected'}`} key={item.id}>
                            <div
                                className="color-indicator-sm"
                                style={{
                                    backgroundColor: COLOR_SCHEME[index],
                                }}/>
                            <div>{item.song}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div
                className="tooltip"
                ref={tooltip}
            ></div>
        </>
    );
};

export default ParallelCoordinates;
