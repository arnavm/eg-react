import React from 'react';

import { VISUALIZER_PROP_TYPES } from './Track';
import GenomicCoordinates from './commonComponents/GenomicCoordinates';
import BarPlot from './commonComponents/BarPlot';
import { PrimaryColorConfig, BackgroundColorConfig } from './contextMenu/ColorConfig';
import NumericalLegend from './commonComponents/NumericalLegend';

import BigWigOrBedSource from '../../dataSources/BigWigOrBedSource';
import { RenderTypes } from '../../art/DesignRenderer';
import { BarPlotRecord } from '../../art/BarPlotDesigner';
import { SimpleBarElementFactory } from '../../art/BarElementFactory';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

import './commonComponents/Tooltip.css';

const TOP_PADDING = 5;
const BAR_CHART_STYLE = {marginTop: TOP_PADDING};
const DEFAULT_OPTIONS = {
    height: 35,
    color: "blue"
};

/*
Expected DASFeature schema

interface DASFeature {
    max: number; // Chromosome base number, end
    maxScore: number;
    min: number; // Chromosome base number, start
    score: number; // Value at the location
    segment: string; // Chromosome name
    type: string;
    _chromId: number
}
*/
function convertToBarPlotRecords(data) {
    return data.map(feature =>
        new BarPlotRecord(new ChromosomeInterval(feature.segment, feature.min, feature.max), feature.score)
    );
}

/**
 * Visualizer for BigWig tracks.
 * 
 * @author Silas Hsu
 */
class BigWigVisualizer extends React.PureComponent {
    static propTypes = VISUALIZER_PROP_TYPES;

    /**
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        this.state = {
            elementFactory: new SimpleBarElementFactory(props.options.height, props.options),
        };
        this.getTooltipContents = this.getTooltipContents.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.options !== nextProps.options) {
            this.setState({elementFactory: new SimpleBarElementFactory(nextProps.options.height, nextProps.options)});
        }
    }

    getTooltipContents(relativeX, record) {
        const {viewRegion, width, trackModel} = this.props;
        const recordValue = record ? record.value.toFixed(2) : '(no data)';
        return (
        <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
            <li className="Tooltip-major-text" >{recordValue}</li>
            <li className="Tooltip-minor-text" >
                <GenomicCoordinates viewRegion={viewRegion} width={width} x={relativeX} />
            </li>
            <li className="Tooltip-minor-text" >{trackModel.getDisplayLabel()}</li>
        </ul>
        );
    }

    /** 
     * @inheritdoc
     */
    render() {
        const {data, viewRegion, width, options} = this.props;
        return (
        <BarPlot
            viewRegion={viewRegion}
            data={data}
            width={width}
            height={options.height}
            elementFactory={this.state.elementFactory}
            style={BAR_CHART_STYLE}
            type={RenderTypes.CANVAS}
            getTooltipContents={this.getTooltipContents}
        />
        );
    }
}

/**
 * Legend for BigWig tracks.
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} element to render
 * @author Silas Hsu
 */
function BigWigLegend(props) {
    return <NumericalLegend
        trackModel={props.trackModel}
        height={props.options.height + TOP_PADDING}
        data={props.data}
        getDataValue={record => record.getValue()}
        topPadding={TOP_PADDING}
    />;
}

const BigWigTrack = {
    visualizer: BigWigVisualizer,
    legend: BigWigLegend,
    menuItems: [PrimaryColorConfig, BackgroundColorConfig],
    defaultOptions: DEFAULT_OPTIONS,
    getDataSource: trackModel => new BigWigOrBedSource(trackModel.url),
    processData: convertToBarPlotRecords,
};

export default BigWigTrack;