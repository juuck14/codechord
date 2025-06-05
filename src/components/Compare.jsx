import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { COLOR_SCHEME, ROMAN_NUMERALS, CHORD_TYPES } from "@/common";

const Compare = ({ selectedItems }) => {
    const ref = useRef();

    const data1 = {
        1: { 5: 0.5, 7: 0.3, 9: 0.2 },
        2: { 5: 0.4, 7: 0.3, 9: 0.3 },
        3: { 5: 0.33,7: 0.33, 9: 0.34 },
        4: { 5: 0.4, 7: 0.2, 9: 0.4 },
        5: { 5: 0.5, 7: 0.15, 9: 0.35 },
        6: { 5: 0.5, 7: 0.15, 9: 0.35 },
        7: { 5: 0.5, 7: 0.15, 9: 0.35 }
    };

    const data2 = [
        { A: { whichChord: 1, whichType: 5 }, B: { whichChord: 2, whichType: 7 } },
        { A: { whichChord: 4, whichType: 5 }, B: { whichChord: 4, whichType: 5 } },
        { A: { whichChord: 3, whichType: 7 }, B: { whichChord: 5, whichType: 5 } }
    ];

    const width = '100%';
    const height = 450;
    const barWidth = 60;
    const spacing = 80;
    const maxBarHeight = 250;
    const xOffset = 50;
    const bottomMargin = 80;

    useEffect(() => {
        drawChart()
    }, [selectedItems]);

    const drawChart = () => {
        const maxLength = Math.max(...selectedItems.map(item => item.chords.length));

        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        // svg
        // .append("line")
        // .attr("x1", 0)
        // .attr("y1", height - bottomMargin)
        // .attr("x2", width)
        // .attr("y2", height - bottomMargin)
        // .attr("stroke", "black")
        // .attr("stroke-width", 1);

        for (let i = 0; i < maxLength; i++) {
            const groupX = xOffset + i * spacing;
            const numberOfAlive = selectedItems.filter(item => item.chords[i] && item.chords[i].root >= 1 && item.chords[i].root <= 7).length;
            const isSameChord = numberOfAlive > 1 && new Set(selectedItems.map(item => item.chords[i].root)).size === 1;
            const realBarWidth = barWidth / numberOfAlive
            let order = 0
            for (let j = 0; j < selectedItems.length; j++) {
                const d = selectedItems[j];
                const chord = d.chords[i];
                if (!chord) continue;

                // 회색 선
                if (isSameChord) {
                    // svg
                    // .append("rect")
                    // .attr("x", groupX + barWidth)
                    // .attr("y", height - bottomMargin - maxBarHeight)
                    // .attr("width", 2)
                    // .attr("height", maxBarHeight)
                    // .attr("fill", "lightgray")
                    // .attr("opacity", 0.6);
                }
                const root = chord.root;
                if (!root || root < 1 || root > 7) continue; // 유효한 루트인지 확인
                const type = chord.type;
                const probs = data1[root];
                const barX = groupX + order * realBarWidth;
                let y0 = height - bottomMargin - maxBarHeight;

                CHORD_TYPES.forEach((k) => {
                    const h = probs[k] * maxBarHeight;

                    svg
                        .append("rect")
                        .attr("x", barX)
                        .attr("y", y0)
                        .attr("width", realBarWidth)
                        .attr("height", h)
                        .attr("fill", "white")
                        .attr("stroke", "black");

                    if (k === type) {
                        svg
                        .append("rect")
                        .attr("x", barX)
                        .attr("y", y0)
                        .attr("width", realBarWidth)
                        .attr("height", h)
                        .attr("fill", COLOR_SCHEME[d.index])
                        .attr("opacity", 0.6);
                    }
                    y0 += h;
                });

                // A, B 라벨
                svg
                    .append("text")
                    .attr("x", barX + 0.5 * realBarWidth)
                    .attr("y", height - bottomMargin + 20)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 14)
                    .text(`${i}`);

                // Roman numeral 라벨
                if (isSameChord && j > 0) continue; // 첫 번째 아이템에만 Roman numeral 표시
                svg
                    .append("text")
                    .attr("x", barX + (isSameChord ? 1 : 0.5) * realBarWidth)
                    .attr("y", height - bottomMargin - maxBarHeight - 10)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 14)
                    .text(`${ROMAN_NUMERALS[root - 1]}`);

                order++
            }
        };
    }

    return <svg ref={ref} width={width} height={height}></svg>;
};

export default Compare;
