import React, { useEffect, useState } from "react";
import { add, format, differenceInCalendarDays } from "date-fns";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import CustomTooltip from "./custom-tooltip.component";
import axios from 'axios';

const dateFormatter = date => {
    return format(new Date(date), "dd/MMM");
};

/**
 * get the dates between `startDate` and `endSate` with equal granularity
 */
const getTicks = (startDate, endDate, num) => {
    const diffDays = differenceInCalendarDays(endDate, startDate);

    let current = startDate,
        velocity = Math.round(diffDays / (num - 1));

    const ticks = [startDate.getTime()];

    for (let i = 1; i < num - 1; i++) {
        ticks.push(add(current, { days: i * velocity }).getTime());
    }

    ticks.push(endDate.getTime());
    return ticks;
};

/**
 * Add data of the date in ticks,
 * if there is no data in that date in `data`.
 *
 * @param Array<number> _ticks
 * @param {*} data
 */
const fillTicksData = (_ticks, data) => {
    const ticks = [..._ticks];
    const filled = [];
    let currentTick = ticks.shift();
    let lastData = null;
    for (const it of data) {
        if (ticks.length && it.date > currentTick && lastData) {
            filled.push({ ...lastData, ...{ date: currentTick } });
            currentTick = ticks.shift();
        } else if (ticks.length && it.date === currentTick) {
            currentTick = ticks.shift();
        }

        filled.push(it);
        lastData = it;
    }

    return filled;
};

const DateArea = ({ tab }) => {
    const startDate = new Date(2000, 0, 11);
    const endDate = new Date(2025, 9, 15);
    const [attr, setAttr] = useState([]);
    const [table, setTable] = useState([]);
    const [data, setData] = useState([]);
    const [query, setQuery] = useState();
    const [selectedAttr, setSelectedAttr] = useState();
    useEffect(() => {
        axios.post('https://v618j3wl9d.execute-api.ap-south-1.amazonaws.com/dev/feedback', {

        }).then(res => {
            setAttr(res.data.attributeNames);
            setTable(res.data.items);
            var temp = res.data.items.map(o => o.Date.S.split('/')[1] + '/' + o.Date.S.split('/')[0] + '/' + o.Date.S.split('/')[2]);
            var map = new Map();
            temp.forEach(ele => {
                if (map.get(ele)) map.set(ele, map.get(ele) + 1);
                else map.set(ele, 1);
            });
            var result = Array.from(map).map(o => ({ date: new Date(o[0]).getTime(), val: o[1] })).sort((a, b) => a.date - b.date);
            setData(result);
        })
    }, [tab]);

    const handleClick = (query) => {
        setQuery(query);
        setTable(table.filter(o => Object.values(o).filter((e) => e["S"].includes(query))[0]))
    };


    const domain = [dataMin => dataMin, () => endDate.getTime()];
    const ticks = getTicks(startDate, endDate, 5);
    const filledData = fillTicksData(ticks, data);

    return (
        <div className="container" style={{ width: "160%" }}>
            <form class="form-inline my-2 my-lg-0" onInput={(e) => handleClick(e.target.value)}>
                <div class="dropdown mr-sm-2">
                    <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {selectedAttr ? selectedAttr : "Attribute Names"}
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        {attr?.map(e => (<a class="dropdown-item" href="javascript:;" onClick={() => setSelectedAttr(e)}>{e}</a>))}
                    </div>
                </div>
                <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
                <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
            </form>

            {query && <table className="table">
                {table && table.length > 0 && Object.keys(table[0]).map(ele => (
                    <th>{ele}</th>
                ))}
                <tbody>
                    {
                        table && table.length > 0 && table
                            .map(ele => (
                                <tr>
                                    {Object.keys(ele).map(index => (
                                        <td className="col">{ele[index]["S"]}</td>
                                    ))}
                                </tr>
                            ))
                    }
                </tbody>
            </table>}


            <p className="mt-4">AreaChart with custom tooltip</p>
            <ResponsiveContainer width="90%" height={200}>
                <AreaChart
                    width={900}
                    height={250}
                    data={data}
                    margin={{
                        top: 10,
                        right: 0,
                        bottom: 10,
                        left: 0
                    }}
                >
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"

                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="val"
                        stroke="#8884d8"
                        fill="url(#colorUv)"
                        fillOpacity={0.6}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DateArea;
