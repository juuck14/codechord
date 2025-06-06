import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
    COLOR_SCHEME,
    ROMAN_NUMERALS,
    CHORD_TYPES,
    COMPARE_STYLE,
    GRAY_COLOR_SCHEME,
    addVariants
} from "@/common";
import ratios from "@/data/ratios.json";

const Compare = ({ selectedItems }) => {
    const ref = useRef();

    useEffect(() => {
        drawChart()
    }, [selectedItems]);

    const drawChart = () => {
        const maxLength = Math.max(...selectedItems.map(item => item.chords.length));
        const barStartY = COMPARE_STYLE.X_LABEL_TOP_HEIGHT + COMPARE_STYLE.MARGIN.TOP
        const svgRaw = d3.select(ref.current);
        svgRaw.selectAll("*").remove();
        const svg = svgRaw.append("g")
            .attr("transform", `translate(0, 5)`);

        // x축 라인
        svg
            .append("line")
            .attr("x1", COMPARE_STYLE.Y_LABEL_WIDTH + COMPARE_STYLE.MARGIN.LEFT)
            .attr("y1", barStartY)
            .attr("x2", COMPARE_STYLE.WIDTH)
            .attr("y2", barStartY)
            .attr("class", "x-axis");
        svg
            .append("line")
            .attr("x1", COMPARE_STYLE.Y_LABEL_WIDTH + COMPARE_STYLE.MARGIN.LEFT)
            .attr("y1", barStartY + COMPARE_STYLE.BAR_HEIGHT)
            .attr("x2", COMPARE_STYLE.WIDTH)
            .attr("y2", barStartY + COMPARE_STYLE.BAR_HEIGHT)
            .attr("class", "x-axis");

        // y 라벨
        svg
            .append("text")
            .attr("x", COMPARE_STYLE.Y_LABEL_WIDTH)
            .attr("y", barStartY + 4)
            .text("100")
            .attr("class", "y-tick");
        svg
            .append("text")
            .attr("x",  COMPARE_STYLE.Y_LABEL_WIDTH)
            .attr("y", barStartY + COMPARE_STYLE.BAR_HEIGHT + 4)
            .text("0")
            .attr("class", "y-tick");

        svg
            .append("text")
            .text("Proportion of Chord Variations (%)")
            .attr("transform", `rotate(270) translate(-${barStartY + COMPARE_STYLE.BAR_HEIGHT / 2}, ${COMPARE_STYLE.Y_LABEL_WIDTH + COMPARE_STYLE.MARGIN.LEFT})`)
            .attr("class", "y-label");

        for (let i = 0; i < maxLength; i++) {
            const xOffset = COMPARE_STYLE.Y_LABEL_WIDTH + COMPARE_STYLE.MARGIN.LEFT + COMPARE_STYLE.X_OFFSET_SIDE;
            const groupX = xOffset + i * (COMPARE_STYLE.SPACING);
            const numberOfAlive = selectedItems.filter(item => item.chords[i] && item.chords[i].root >= 1 && item.chords[i].root <= 7).length;
            const isSameChord = numberOfAlive > 1 && new Set(selectedItems.map(item => item.chords[i].root)).size === 1;
            let order = 0

            // Bar i
            svg
                .append("text")
                .attr("x", groupX + 0.5 * COMPARE_STYLE.BAR_WIDTH)
                .attr("y", COMPARE_STYLE.HEIGHT())
                .text(`Bar ${i + 1}`)
                .attr("class", "x-label");
            
            for (let j = 0; j < selectedItems.length; j++) {
                
                const d = selectedItems[j];
                const chord = d.chords[i];
                if (!chord) continue;

                const root = chord.root;
                if (!root || root < 1 || root > 7) continue; // 유효한 루트인지 확인
                const variants = addVariants(chord);
                const allVariantsRatios = ratios[chord.beat][root]
                const allVariants = Object.keys(allVariantsRatios).sort((a, b) => allVariantsRatios[b] - allVariantsRatios[a]);
                let y0 = barStartY;
                let dataBarWidth = (COMPARE_STYLE.BAR_WIDTH - (numberOfAlive - 1) * COMPARE_STYLE.BAR_GAP) / numberOfAlive
                let realBarWidth = dataBarWidth
                let barX = groupX + order * (dataBarWidth + COMPARE_STYLE.BAR_GAP);
                
                if (isSameChord) {
                    dataBarWidth = COMPARE_STYLE.BAR_WIDTH / numberOfAlive;
                    realBarWidth = COMPARE_STYLE.BAR_WIDTH
                    barX = groupX + order * dataBarWidth;
                }

                // DATA BAR
                allVariants.forEach((k) => {
                    const h = allVariantsRatios[k] * COMPARE_STYLE.BAR_HEIGHT;

                    if (k === variants) {
                        svg
                        .append("rect")
                        .attr("x", barX)
                        .attr("y", y0)
                        .attr("width", dataBarWidth)
                        .attr("height", h)
                        .attr("fill", COLOR_SCHEME[d.index])
                        .style("z-index", 10);
                    }
                    y0 += h;
                });

                if(isSameChord && j > 0) break

                y0 = COMPARE_STYLE.X_LABEL_TOP_HEIGHT + COMPARE_STYLE.MARGIN.TOP;
                allVariants.forEach((k, index) => {
                    const h = allVariantsRatios[k] * COMPARE_STYLE.BAR_HEIGHT;

                    svg
                        .append("rect")
                        .attr("x", barX)
                        .attr("y", y0)
                        .attr("width", realBarWidth)
                        .attr("height", h)
                        .attr("fill", GRAY_COLOR_SCHEME[index])
                        .lower()

                    // 중간 다이어토닉

                    y0 += h;
                })

                // 상단 다이어토닉
                const diatonicTop = svg
                    .append("g")
                    .attr("transform", `translate(${barX})`)
                    .attr("class", "diatonic-top")

                diatonicTop.append("rect")
                    .attr("x0", 0)
                    .attr("y0", 0)
                    .attr("width", realBarWidth)
                    .attr("height", COMPARE_STYLE.X_LABEL_TOP_HEIGHT)
                    .attr("class", "frame")
                    
                diatonicTop.append("text")
                    .attr("x", realBarWidth / 2)
                    .attr("y", (COMPARE_STYLE.X_LABEL_TOP_HEIGHT + COMPARE_STYLE.X_LABEL_TOP_FONT_SIZE) / 2)
                    .style("font-size", COMPARE_STYLE.X_LABEL_TOP_FONT_SIZE)
                    .text(`${ROMAN_NUMERALS[root - 1]}`)
                    .attr("class", "chord")


                order++
            }
        };
    }

    return (
        <div className="compare-area">
            
            <div className="title-area pl-[40px]">Bar-by-Bar Breakdown of Chord Variants in the Song</div>
            <div className="mb-[27px]">
                <svg ref={ref} width={COMPARE_STYLE.WIDTH} height={COMPARE_STYLE.HEIGHT() + 10}></svg>
            </div>
            <div className="legend-area">
                {selectedItems.map((item, index) => (
                    <div className="flex items-center">
                        <div
                            className="color-indicator-sm"
                            style={{
                                backgroundColor: COLOR_SCHEME[item.index],
                            }}/>
                        <div>{item.song} ({item.section})</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Compare;
