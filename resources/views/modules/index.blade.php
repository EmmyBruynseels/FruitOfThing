@extends('layouts.app')

@section('content')
    <div class="container pt-3">
        <div class="row mt-3 font-weight-bold d-none d-md-flex">
            <div class="col-lg-2 col-md-3">Naam</div>
            <div class="col-lg-2 col-md-2">Veld <a href="{{ route('fields') }}"><i class="fas fa-external-link-alt"></i></a></div>
            <div class="col-lg-2 col-md-2">GSM nummer</div>
            <div class="col-lg-1 col-md-1">Batterij</div>
            <div class="col-lg-2 col-md-2">Uptime</div>
            <div class="col-lg-2 col-md-2">Laatste connectie</div>
        </div>
        <hr>
        @foreach ($modules as $module)
            <div class="row">
                <div class="col-lg-2 col-md-3 col-12">
                    <span class="font-weight-bolder">{{ $module->name }}</span>
                </div>
                <div class="col-lg-2 col-md-2 col-4">
                    <a href="javascript:void" data-toggle="popover" title="{{ $module->field->name }}" data-html="true"
                       data-trigger="hover"
                       data-content="Type: {{ $module->field->fruit_type->name }}<br>
                       Adres: {{ $module->field->adres }}<br>
                       Postcode: {{ $module->field->postcode }}">{{ $module->field->name }}
                    </a>
                </div>
                <div class="col-lg-2 col-md-2 col">
                    {{ $module->phone_number }}
                </div>
                <div class="col-lg-1 col-md-1 col-4 text-md-left text-right">
                    <span class="d-md-none"><i class="fas fa-battery-full"></i> </span>{{ $module->battery_level }}%
                </div>
                <div class="col-lg-2 col-md-2 col-auto">
                    {{ $module->uptime }}
                </div>
                <div class="col-lg-2 col-md-2 col-6">
                    {{ date_create_from_format('Y-m-d H:i:s', $module->last_connection)->format('d/m/Y H:i:s') }}
                </div>
            </div>
            <hr>
        @endforeach
    </div>
@endsection