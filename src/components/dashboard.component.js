import React, { useState } from "react";
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
import usePagination from "../services/pagination.service";
import axios from "axios";

const dateFormatter = date => {
    return format(new Date(date), "dd/MM/yyyy");
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

const DateArea = ({ table, attr, data, setTable }) => {
    const startDate = new Date(2000, 0, 11);
    const endDate = new Date(2025, 9, 15);
    const [query, setQuery] = useState();
    const [show, setShow] = useState();
    const [form, setForm] = useState({});
    const [selectedAttr, setSelectedAttr] = useState();
    const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(table, 10);

    const handleClick = (query) => {
        setQuery(query);
        setTable(table.filter(o => Object.values(o).filter((e) => e.includes(query))[0]))
    };

    const handleSubmit = () => {
        axios.put('https://v618j3wl9d.execute-api.ap-south-1.amazonaws.com/dev/feedback',
            JSON.stringify(form),
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((res) => setShow(false));
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

            <div className="d-flex justify-content-between">
                <div className="">
                    <div className="action">
                        <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => setShow(true)}>Check In</button>
                        <button type="button" className="btn btn-warning">Check Out</button>

                        <div class="modal" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" style={{ display: show ? "block" : "none" }}>
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="exampleModalLabel">Key Registration</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <form>
                                            <div class="mb-3">
                                                <label for="recipient-name" class="col-form-label">KeyNo:</label>
                                                <input type="text" class="form-control" id="recipient-name" onChange={(e) => setForm({ ...form, KeyNO: e.target.value })} />
                                            </div>
                                            <div class="mb-3">
                                                <label for="message-text" class="col-form-label">EmployeeName:</label>
                                                <input type="text" class="form-control" id="message-text" onChange={(e) => setForm({ ...form, Employeesame: e.target.value })} />
                                            </div>
                                            <div class="mb-3">
                                                <label for="message-text" class="col-form-label">IssueDate:</label>
                                                <input type="date" class="form-control" id="message-text" onChange={(e) => setForm({ ...form, Date: dateFormatter(e.target.value) })} />
                                            </div>
                                            <div class="mb-3">
                                                <label for="message-text" class="col-form-label">ReturnDate:</label>
                                                <input type="date" class="form-control" id="message-text" onChange={(e) => setForm({ ...form, ReturnedDiets: dateFormatter(e.target.value) })} />
                                            </div>
                                        </form>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setShow(false)}>Close</button>
                                        <button type="button" class="btn btn-primary" onClick={handleSubmit}>Send message</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {<table className="table">
                        {currentData() && currentData().length > 0 && Object.keys(currentData()[0]).map(ele => (
                            <th>{ele}</th>
                        ))}
                        <tbody>
                            {
                                currentData() && currentData().length > 0 && currentData()
                                    .map(ele => (
                                        <tr>
                                            {Object.keys(ele).map(index => (
                                                <td className="col">{ele[index]}</td>
                                            ))}
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>}
                    <nav aria-label="...">
                        <ul class="pagination">
                            <li class="page-item">
                                <a class="page-link" href="javascript:;" tabindex="-1" onClick={prev}>Previous</a>
                            </li>
                            {Array.from(Array(maxPage), (_, i) => i + 1).map(ele =>
                                <li class={`page-item ${ele === currentPage ? 'active' : ''}`}>
                                    <a class="page-link" href="javascript:;" onClick={() => jump(ele)}>{ele}</a>
                                </li>)}
                            <li class="page-item">
                                <a class="page-link" href="javascript:;" onClick={next}>Next</a>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div>
                    <p className="mt-4">AreaChart with custom tooltip</p>
                    <ResponsiveContainer width={400} height={200}>
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
            </div>
        </div>
    );
};

export default DateArea;
