import * as React from 'react'
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {Bar} from "react-chartjs-2";
import {BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip} from "chart.js";


export interface Cargo {
    id: number;
    name: string;
    content: string;
    cityFrom: string;
    cityTo: string;
    dateFrom: string;
    dateTo: string;
}

const DAYS = 7;

export function CargoTraffic() {

    const redirect = useNavigate()
    const [cargos, setCargos] = React.useState<Array<Cargo>>([])
    const [initialCargos, setInitialCargos] = React.useState<Array<Cargo>>([])

    const [search, setSearch] = React.useState('')
    const [gist, setGist] = React.useState<any>([])

    React.useEffect(() => {
        const promise = axios({
            method: 'get',
            url: 'http://localhost:8080/cargo',
            headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
        })
        promise.then((res) => {
            setCargos(res.data)
            setInitialCargos(res.data)
        }).catch((e) => redirect('/auth'))
    }, [])

    const sort = (value: string) => {
        setCargos((state) => [...state.sort((a: any, b: any) => {
            if (a[value] > b[value]) return 1
            if (a[value] < b[value]) return -1
            return 0
        })])
    }

    const searchCargos = () => {
        setCargos([...initialCargos.filter((a: Cargo) => {
            return a.name?.includes(search) || a.content?.includes(search) || a.cityFrom?.includes(search) || a.cityTo?.includes(search) || a.dateFrom?.includes(search) || a.dateTo?.includes(search)
        })])
    }

    const searchCargosByDateTo = () => {
        setCargos([...initialCargos.filter((a: Cargo) => {
            return a.dateTo?.includes(search)
        })])
    }

    React.useEffect(() => {
        let arr: any[] = [];
        for(let i = 0; i < DAYS; i++){
            const day = new Date(Date.now()-86400000 * i);
            const yyyy = day.getFullYear();
            let mm = day.getMonth() + 1; // Months start at 0!
            let dd = day.getDate();
            let formattedToday = yyyy + '-';
            if (mm < 10){
                formattedToday += '0' + mm;
            }else{
                formattedToday += mm
            }
            formattedToday += '-'
            if (dd < 10){
                formattedToday += '0' + dd;
            }else{
                formattedToday += dd;
            }
            let count = 0;
            for(let j = 0; j < initialCargos.length; j++){
                // @ts-ignore
                if(initialCargos[j].dateTo == formattedToday){
                    count++;
                }
            }
            arr.push({date: formattedToday, count})
        }
        setGist(arr.reverse())
    }, [initialCargos])


    const labels = [...gist.map((el) => el.date)];
    const data = {
        labels: labels,
        datasets: [
            {
                label: `Грузы за последние ${DAYS} дней`,
                backgroundColor: "#8f755b",
                borderColor: "#8f755b",
                data: [...gist.map((el) => el.count)],
            },
        ],
    };


    Chart.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );

    return (
        <div className={'mt-4 ml-4 flex flex-col'}>
            <div className={'flex flex-row items-center'}>
                <button className={'border-2 box-border p-[10px] w-[150px]'}
                        onClick={() => redirect('/create-cargo')}>Создать груз
                </button>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                       className={'border-2 w-[150px] h-[30px] ml-4 rounded-md'}/>
                <button className={'ml-2 border-2 w-[100px] h-[30px]'} onClick={searchCargos}>Поиск</button>
                <button className={'ml-2 border-2 w-[30px] h-[30px]'} onClick={() => setCargos(initialCargos)}>X
                </button>

                <button className={'ml-2 border-2 w-[200px] h-[30px]'} onClick={searchCargosByDateTo}>Поиск по дате прибытия</button>
                <button className={'ml-2 border-2 w-[30px] h-[30px]'} onClick={() => setCargos(initialCargos)}>X
                </button>
            </div>
            <p>Количество грузов: {cargos.length}</p>
            <table className={'border-2 mt-4'}>
                <thead>
                <th className={'border-2'} onClick={() => sort('name')}>Название</th>
                <th className={'border-2'} onClick={() => sort('content')}>Содержимое</th>
                <th className={'border-2'} onClick={() => sort('cityFrom')}>Город отправки</th>
                <th className={'border-2'} onClick={() => sort('cityTo')}>Город прибытия</th>
                <th className={'border-2'} onClick={() => sort('dateFrom')}>Дата отправки</th>
                <th className={'border-2'} onClick={() => sort('dateTo')}>Дата прибытия</th>
                </thead>
                <tbody>
                {cargos.map((cargo: Cargo) => (
                    <tr className={'border-2'} key={cargo.id} onClick={() => redirect(`/cargo-page/${cargo.id}`)}>
                        <td className={'border-2 text-center'}>{cargo.name} </td>
                        <td className={'border-2 text-center'}>{cargo.content} </td>
                        <td className={'border-2 text-center'}>{cargo.cityFrom} </td>
                        <td className={'border-2 text-center'}>{cargo.cityTo} </td>
                        <td className={'border-2 text-center'}>{cargo.dateFrom} </td>
                        <td className={'border-2 text-center'}>{cargo.dateTo} </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Bar data={data}/>
        </div>
    )

}